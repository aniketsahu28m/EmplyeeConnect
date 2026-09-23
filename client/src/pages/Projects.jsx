import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import FormModal from '../components/FormModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';
import { StatusLabel } from '../components/StatusLabel';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    start_date: '',
    end_date: '',
    manager_id: ''
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatus = (project) => {
    const now = new Date();
    const startDate = new Date(project.start_date);
    const endDate = project.end_date ? new Date(project.end_date) : null;

    if (endDate && now > endDate) return 'Completed';
    if (now >= startDate && (!endDate || now <= endDate)) return 'Active';
    if (now < startDate) return 'Upcoming';
    return 'Unknown';
  };

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if user is a manager
      if (user.role === 'Manager') {
        // Find the employee ID for this manager
        const employeeRes = await axios.get('/api/employees');
        const currentEmployee = employeeRes.data.find(emp => emp.user_id === user.id);
        
        if (currentEmployee) {
          // Get only projects managed by this employee
          const response = await axios.get(`/api/projects/manager/${currentEmployee.employee_id}`);
          setProjects(response.data);
        }
      } else {
        // Admin or regular employee can see all projects
        const response = await axios.get('/api/projects');
        setProjects(response.data);
      }
    } catch (error) {
      toast.error('Error fetching projects');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user.role, user.id]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, [fetchProjects]);

  const handleAdd = () => {
    setSelectedProject(null);
    setFormData({
      project_name: '',
      description: '',
      start_date: '',
      end_date: '',
      manager_id: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    const startDate = project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '';
    const endDate = project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '';
    
    setFormData({
      project_name: project.project_name,
      description: project.description || '',
      start_date: startDate,
      end_date: endDate,
      manager_id: project.manager_id || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (project) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/api/projects/${project.project_id}`);
        toast.success('Project deleted successfully');
        fetchProjects();
      } catch (error) {
        if (error.response && error.response.status === 400) {
          toast.error('Cannot delete project with associated tasks');
        } else {
          toast.error('Error deleting project');
        }
        console.error('Error:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProject) {
        await axios.put(
          `/api/projects/${selectedProject.project_id}`,
          formData
        );
        toast.success('Project updated successfully');
      } else {
        await axios.post('/api/projects', formData);
        toast.success('Project added successfully');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      toast.error('Error saving project');
      console.error('Error:', error);
    }
  };

  const renderProjectCards = () => {
    if (projects.length === 0) {
      return (
        <div className="card px-6 py-12 text-center text-[13px] text-gray-500">
          No projects yet.
          {canAdd && (
            <button onClick={handleAdd} className="ml-1 font-medium text-blue-700 hover:underline">
              Create the first one.
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map(project => (
          <article key={project.project_id} className="card flex flex-col p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-gray-900">{project.project_name}</h2>
              <StatusLabel status={getStatus(project)} />
            </div>
            <p className="mt-0.5 text-[13px] text-gray-500">
              {project.manager_name ? `Led by ${project.manager_name}` : 'No manager assigned'}
            </p>
            <p className="mt-3 line-clamp-3 flex-1 text-[13px] leading-relaxed text-gray-700">
              {project.description || <span className="text-gray-400">No description.</span>}
            </p>

            <dl className="mt-4 grid grid-cols-2 border-t border-gray-100 pt-3 text-[13px]">
              <div>
                <dt className="text-xs text-gray-500">Start</dt>
                <dd className="tabular-nums text-gray-900">{formatDate(project.start_date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">End</dt>
                <dd className="tabular-nums text-gray-900">{formatDate(project.end_date)}</dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <Link to="/tasks" className="text-[13px] font-medium text-blue-700 hover:underline">
                View tasks
              </Link>
              <div className="flex">
                {canEdit && (
                  <button
                    onClick={() => handleEdit(project)}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    title="Edit"
                    aria-label="Edit project"
                  >
                    <LuPencil className="h-3.5 w-3.5" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(project)}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-700"
                    title="Delete"
                    aria-label="Delete project"
                  >
                    <LuTrash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  };

  // Check user role for permissions
  const canAdd = user?.role !== 'Employee';
  const canEdit = user?.role !== 'Employee';
  const canDelete = user?.role === 'Admin';

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">
            Projects
            {!isLoading && <span className="ml-2 text-base font-normal text-gray-400">{projects.length}</span>}
          </h1>
          <p className="mt-1 text-[13px] text-gray-500">
            {user.role === 'Manager' ? 'Projects you lead.' : 'All projects, with their lead and timeline.'}
          </p>
        </div>
        {canAdd && (
          <button onClick={handleAdd} className="btn-primary">
            <LuPlus className="h-3.5 w-3.5" />
            New project
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-[13px] text-gray-500">Loading projects…</p>
      ) : (
        renderProjectCards()
      )}

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={selectedProject ? 'Edit Project' : 'Add New Project'}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="project_name"
              className="block text-sm font-medium text-gray-700"
            >
              Project Name
            </label>
            <input
              type="text"
              id="project_name"
              value={formData.project_name}
              onChange={(e) =>
                setFormData({ ...formData, project_name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="manager_id"
              className="block text-sm font-medium text-gray-700"
            >
              Project Manager
            </label>
            <select
              id="manager_id"
              value={formData.manager_id}
              onChange={(e) =>
                setFormData({ ...formData, manager_id: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select Manager</option>
              {employees.filter(employee => 
                // Show only users with manager role
                employee.role === 'Manager'
              ).map((employee) => (
                <option key={employee.employee_id} value={employee.employee_id}>
                  {`${employee.first_name} ${employee.last_name}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for ongoing projects
            </p>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Projects; 