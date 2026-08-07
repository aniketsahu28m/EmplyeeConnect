import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaProjectDiagram, FaTasks, FaUserTie } from 'react-icons/fa';

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
    if (!dateString) return 'Not Set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const columns = [
    { key: 'project_name', label: 'Project Name' },
    { key: 'manager_name', label: 'Manager' },
    { key: 'start_date', label: 'Start Date', render: (item) => formatDate(item.start_date) },
    { key: 'end_date', label: 'End Date', render: (item) => formatDate(item.end_date) },
    { 
      key: 'status', 
      label: 'Status', 
      render: (item) => {
        const now = new Date();
        const startDate = new Date(item.start_date);
        const endDate = item.end_date ? new Date(item.end_date) : null;
        
        if (endDate && now > endDate) {
          return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
        } else if (now >= startDate && (!endDate || now <= endDate)) {
          return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Active</span>;
        } else if (now < startDate) {
          return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Upcoming</span>;
        }
        
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
      } 
    }
  ];

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // Check if user is a manager
      if (user.role === 'Manager') {
        // Find the employee ID for this manager
        const employeeRes = await axios.get('http://localhost:5000/api/employees');
        const currentEmployee = employeeRes.data.find(emp => emp.user_id === user.id);
        
        if (currentEmployee) {
          // Get only projects managed by this employee
          const response = await axios.get(`http://localhost:5000/api/projects/manager/${currentEmployee.employee_id}`);
          setProjects(response.data);
        }
      } else {
        // Admin or regular employee can see all projects
        const response = await axios.get('http://localhost:5000/api/projects');
        setProjects(response.data);
      }
    } catch (error) {
      toast.error('Error fetching projects');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

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
        await axios.delete(`http://localhost:5000/api/projects/${project.project_id}`);
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
          `http://localhost:5000/api/projects/${selectedProject.project_id}`,
          formData
        );
        toast.success('Project updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/projects', formData);
        toast.success('Project added successfully');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      toast.error('Error saving project');
      console.error('Error:', error);
    }
  };

  // Render project cards instead of just using DataTable
  const renderProjectCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {projects.map(project => (
          <div key={project.project_id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-blue-500 text-white p-4">
              <h3 className="text-lg font-semibold">{project.project_name}</h3>
              <p className="text-sm text-blue-100">
                {project.manager_name ? `Manager: ${project.manager_name}` : 'No manager assigned'}
              </p>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                {project.description || 'No description available'}
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="text-sm font-medium">{formatDate(project.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">End Date</p>
                    <p className="text-sm font-medium">{formatDate(project.end_date)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                {user && (user.role === 'Admin' || user.role === 'Manager') && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="px-3 py-1 text-xs font-medium rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    {user.role === 'Admin' && (
                      <button
                        onClick={() => handleDelete(project)}
                        className="px-3 py-1 text-xs font-medium rounded bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
                
                <a 
                  href={`/tasks?project=${project.project_id}`}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <FaTasks className="mr-1" />
                  View Tasks
                </a>
              </div>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && !isLoading && (
          <div className="col-span-3 bg-white rounded-lg shadow p-8 text-center">
            <FaProjectDiagram className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No projects found</p>
            {user && user.role !== 'Employee' && (
              <button
                onClick={handleAdd}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Project
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Check user role for permissions
  const canAdd = user?.role !== 'Employee';
  const canEdit = user?.role !== 'Employee';
  const canDelete = user?.role === 'Admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization's projects
          </p>
        </div>
        
        {canAdd && (
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Project
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
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