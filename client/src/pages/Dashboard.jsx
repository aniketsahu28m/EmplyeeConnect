import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaProjectDiagram, FaTasks, FaClock, FaMoneyBillWave, FaCheck, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_employees: 0,
    total_projects: 0,
    total_tasks: 0,
    pending_tasks: 0
  });
  
  const [employeeStats, setEmployeeStats] = useState({
    assigned_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0
  });
  
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEmployeeStats = async () => {
    try {
      if (user.role === 'Employee') {
        // Get the employee ID for this user
        const employeeRes = await axios.get('http://localhost:5000/api/employees');
        const currentEmployee = employeeRes.data.find(emp => emp.user_id === user.id);
        
        if (currentEmployee) {
          // Get tasks for this employee
          const tasksRes = await axios.get(`http://localhost:5000/api/tasks/employee/${currentEmployee.employee_id}`);
          const tasks = tasksRes.data;
          
          // Calculate stats
          const assignedTasks = tasks.length;
          const completedTasks = tasks.filter(task => task.status === 'Completed').length;
          const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
          const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
          
          setEmployeeStats({
            assigned_tasks: assignedTasks,
            completed_tasks: completedTasks,
            pending_tasks: pendingTasks,
            in_progress_tasks: inProgressTasks
          });
        }
      }
    } catch (error) {
      console.error('Error fetching employee stats:', error);
    }
  };

  useEffect(() => {
    if (user.role !== 'Employee') {
      fetchStats();
    }
    
    if (user.role === 'Employee') {
      fetchEmployeeStats();
    }

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [user.role]);

  const adminStatCards = [
    {
      title: 'Total Employees',
      value: stats.total_employees,
      icon: FaUsers,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Projects',
      value: stats.total_projects,
      icon: FaProjectDiagram,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Tasks',
      value: stats.total_tasks,
      icon: FaTasks,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Pending Tasks',
      value: stats.pending_tasks,
      icon: FaClock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];
  
  const employeeStatCards = [
    {
      title: 'Assigned Tasks',
      value: employeeStats.assigned_tasks,
      icon: FaTasks,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Completed Tasks',
      value: employeeStats.completed_tasks,
      icon: FaCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'In Progress',
      value: employeeStats.in_progress_tasks,
      icon: FaClock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Pending Tasks',
      value: employeeStats.pending_tasks,
      icon: FaClock,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];
  
  // Choose which stat cards to display based on user role
  const statCards = user.role === 'Employee' ? employeeStatCards : adminStatCards;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  const getRoleDisplay = () => {
    switch (user.role) {
      case 'Admin':
        return 'Administrator';
      case 'Manager':
        return 'Project Manager';
      case 'Employee':
        return 'Team Member';
      default:
        return user.role;
    }
  };

  return (
    <div className="bg-white">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Logo size="small" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {user?.first_name}!
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome to your {getRoleDisplay()} dashboard
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">
              {currentTime.toLocaleTimeString()}
            </div>
            <p className="text-sm text-gray-500">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {loading ? '...' : card.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {user.role === 'Admin' && (
              <button
                onClick={() => navigate('/employees')}
                className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <FaUsers className="w-6 h-6 text-blue-500 mb-2" />
                <h3 className="font-medium">Manage Employees</h3>
                <p className="text-sm text-gray-500">Add, edit, or remove employees</p>
              </button>
            )}
            
            {(user.role === 'Admin' || user.role === 'Manager') && (
              <button
                onClick={() => navigate('/projects')}
                className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <FaProjectDiagram className="w-6 h-6 text-green-500 mb-2" />
                <h3 className="font-medium">View Projects</h3>
                <p className="text-sm text-gray-500">Check project status and details</p>
              </button>
            )}

            {(user.role === 'Admin' || user.role === 'Manager') && (
              <button
                onClick={() => navigate('/tasks')}
                className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <FaTasks className="w-6 h-6 text-purple-500 mb-2" />
                <h3 className="font-medium">Manage Tasks</h3>
                <p className="text-sm text-gray-500">Assign and track tasks</p>
              </button>
            )}

            {user.role === 'Admin' && (
              <button
                onClick={() => navigate('/payroll')}
                className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <FaMoneyBillWave className="w-6 h-6 text-yellow-500 mb-2" />
                <h3 className="font-medium">Payroll</h3>
                <p className="text-sm text-gray-500">Manage employee salaries</p>
              </button>
            )}

            {user.role === 'Admin' && (
              <button
                onClick={() => navigate('/attendance')}
                className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <FaCalendarAlt className="w-6 h-6 text-red-500 mb-2" />
                <h3 className="font-medium">Attendance</h3>
                <p className="text-sm text-gray-500">Track employee attendance</p>
              </button>
            )}

            {user.role === 'Admin' && (
              <button
                onClick={() => navigate('/reports')}
                className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <FaFileAlt className="w-6 h-6 text-indigo-500 mb-2" />
                <h3 className="font-medium">Reports</h3>
                <p className="text-sm text-gray-500">Generate system reports</p>
              </button>
            )}

            {user.role === 'Employee' && (
              <button
                onClick={() => navigate('/tasks')}
                className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <FaTasks className="w-6 h-6 text-purple-500 mb-2" />
                <h3 className="font-medium">My Tasks</h3>
                <p className="text-sm text-gray-500">View and update your tasks</p>
              </button>
            )}

            {user.role === 'Employee' && (
              <button
                onClick={() => navigate('/attendance')}
                className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <FaCalendarAlt className="w-6 h-6 text-red-500 mb-2" />
                <h3 className="font-medium">Attendance</h3>
                <p className="text-sm text-gray-500">Mark your attendance</p>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {user.role === 'Employee' ? 'My Progress' : 'System Overview'}
          </h2>
          <div className="space-y-4">
            {user.role === 'Employee' ? (
              <>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Task Completion Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {loading ? '...' : 
                        `${Math.round((employeeStats.completed_tasks / employeeStats.assigned_tasks) * 100 || 0)}%`
                      }
                    </p>
                  </div>
                  <div className="w-16 h-16">
                    <div className="w-full h-full rounded-full border-4 border-green-500 flex items-center justify-center">
                      <FaTasks className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasks In Progress</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {loading ? '...' : employeeStats.in_progress_tasks}
                    </p>
                  </div>
                  <div className="w-16 h-16">
                    <div className="w-full h-full rounded-full border-4 border-yellow-500 flex items-center justify-center">
                      <FaClock className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Task Completion Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {loading ? '...' : 
                        `${Math.round((stats.total_tasks - stats.pending_tasks) / stats.total_tasks * 100 || 0)}%`
                      }
                    </p>
                  </div>
                  <div className="w-16 h-16">
                    <div className="w-full h-full rounded-full border-4 border-green-500 flex items-center justify-center">
                      <FaTasks className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {loading ? '...' : stats.total_projects}
                    </p>
                  </div>
                  <div className="w-16 h-16">
                    <div className="w-full h-full rounded-full border-4 border-blue-500 flex items-center justify-center">
                      <FaProjectDiagram className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 