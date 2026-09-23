import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { StatusLabel, PriorityLabel } from '../components/StatusLabel';

const ROLE_NAMES = { Admin: 'Administrator', Manager: 'Manager', Employee: 'Employee' };

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const projectStatus = (project) => {
  const now = new Date();
  const start = new Date(project.start_date);
  const end = project.end_date ? new Date(project.end_date) : null;
  if (end && now > end) return 'Completed';
  if (now >= start) return 'Active';
  return 'Upcoming';
};

// Finds the employee record behind the logged-in user (tasks and projects are keyed by employee_id).
const findEmployeeId = async (userId) => {
  const res = await axios.get('/api/employees');
  return res.data.find((emp) => emp.user_id === userId)?.employee_id;
};

const Stat = ({ label, value, note, loading }) => (
  <div className="bg-white px-5 py-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-gray-900">
      {loading ? <span className="text-gray-300">–</span> : value}
    </p>
    {note && <p className="mt-0.5 text-xs text-gray-500">{loading ? ' ' : note}</p>}
  </div>
);

const Panel = ({ title, to, linkText = 'View all', children }) => (
  <section className="card">
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5">
      <h2 className="text-[13px] font-semibold text-gray-900">{title}</h2>
      {to && (
        <Link to={to} className="text-xs font-medium text-blue-700 hover:underline">
          {linkText}
        </Link>
      )}
    </div>
    {children}
  </section>
);

const Dashboard = () => {
  const { user } = useAuth();
  const isEmployee = user.role === 'Employee';
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === 'Employee') {
          const employeeId = await findEmployeeId(user.id);
          if (employeeId) {
            const res = await axios.get(`/api/tasks/employee/${employeeId}`);
            setTasks(res.data);
          }
          return;
        }

        const [statsRes, tasksRes] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/tasks'),
        ]);
        setStats(statsRes.data);
        setTasks(tasksRes.data);

        if (user.role === 'Manager') {
          const employeeId = await findEmployeeId(user.id);
          const res = employeeId ? await axios.get(`/api/projects/manager/${employeeId}`) : { data: [] };
          setProjects(res.data);
        } else {
          const res = await axios.get('/api/projects');
          setProjects(res.data);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.role, user.id]);

  const count = (status) => tasks.filter((t) => t.status === status).length;
  const today = startOfToday();
  const openTasks = tasks
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const overdue = openTasks.filter((t) => t.deadline && new Date(t.deadline) < today).length;

  const statItems = isEmployee
    ? [
        { label: 'Assigned to you', value: tasks.length, note: `${count('Completed')} completed` },
        { label: 'In progress', value: count('In Progress') },
        { label: 'Not started', value: count('Pending') },
        { label: 'Overdue', value: overdue, note: overdue ? 'Past their deadline' : 'Nothing late' },
      ]
    : [
        { label: 'Employees', value: stats?.total_employees ?? 0, note: 'On the payroll' },
        {
          label: 'Projects',
          value: stats?.total_projects ?? 0,
          note: `${projects.filter((p) => projectStatus(p) === 'Active').length} active`,
        },
        { label: 'Tasks', value: stats?.total_tasks ?? 0, note: `${count('Completed')} completed` },
        { label: 'Overdue tasks', value: overdue, note: `${count('In Progress')} in progress` },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">{isEmployee ? 'Your work' : 'Overview'}</h1>
        <p className="mt-1 text-[13px] text-gray-500">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          {' · '}
          {user.first_name} {user.last_name}, {ROLE_NAMES[user.role] ?? user.role}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 lg:grid-cols-4">
        {statItems.map((item) => (
          <Stat key={item.label} {...item} loading={loading} />
        ))}
      </div>

      <div className={`grid grid-cols-1 gap-6 ${isEmployee ? '' : 'lg:grid-cols-3'}`}>
        <div className={isEmployee ? '' : 'lg:col-span-2'}>
          <Panel title={isEmployee ? 'Your open tasks' : 'Open tasks'} to="/tasks">
            {loading ? (
              <p className="px-4 py-8 text-center text-[13px] text-gray-500">Loading…</p>
            ) : openTasks.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-gray-500">No open tasks.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="px-4 py-2 font-medium">Task</th>
                      {!isEmployee && <th className="px-4 py-2 font-medium">Assignee</th>}
                      <th className="px-4 py-2 font-medium">Priority</th>
                      <th className="px-4 py-2 font-medium">Due</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {openTasks.slice(0, 6).map((task) => {
                      const late = task.deadline && new Date(task.deadline) < today;
                      return (
                        <tr key={task.task_id}>
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-gray-900">{task.task_name}</p>
                            <p className="text-xs text-gray-500">{task.project_name}</p>
                          </td>
                          {!isEmployee && (
                            <td className="whitespace-nowrap px-4 py-2.5 text-gray-700">
                              {task.assigned_to_first_name} {task.assigned_to_last_name}
                            </td>
                          )}
                          <td className="px-4 py-2.5">
                            <PriorityLabel priority={task.priority} />
                          </td>
                          <td className={`whitespace-nowrap px-4 py-2.5 tabular-nums ${late ? 'font-medium text-red-700' : 'text-gray-700'}`}>
                            {formatDate(task.deadline)}
                            {late && <span className="ml-1 text-xs font-normal">(late)</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusLabel status={task.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        {!isEmployee && (
          <Panel title={user.role === 'Manager' ? 'Your projects' : 'Projects'} to="/projects">
            {loading ? (
              <p className="px-4 py-8 text-center text-[13px] text-gray-500">Loading…</p>
            ) : projects.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-gray-500">No projects yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {projects.slice(0, 5).map((project) => (
                  <li key={project.project_id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-gray-900">{project.project_name}</p>
                      <p className="text-xs text-gray-500">
                        {project.end_date ? `Due ${formatDate(project.end_date)}` : 'No end date'}
                      </p>
                    </div>
                    <StatusLabel status={projectStatus(project)} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
