import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    project_id: '',
    task_name: '',
    description: '',
    deadline: '',
    status: 'Pending',
    priority: 'Medium',
    assigned_to: ''
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">High</span>;
      case 'Medium':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'Low':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Low</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{priority}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 mr-1" />
            <span className="text-green-800">Completed</span>
          </div>
        );
      case 'In Progress':
        return (
          <div className="flex items-center">
            <FaClock className="text-yellow-500 mr-1" />
            <span className="text-yellow-800">In Progress</span>
          </div>
        );
      case 'Pending':
        return (
          <div className="flex items-center">
            <FaExclamationCircle className="text-red-500 mr-1" />
            <span className="text-red-800">Pending</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Define columns based on user role
  const getColumns = () => {
    const baseColumns = [
    { key: 'task_name', label: 'Task Name' },
    { key: 'project_name', label: 'Project' },
      { key: 'deadline', label: 'Deadline', render: (item) => formatDate(item.deadline) },
      { key: 'priority', label: 'Priority', render: (item) => getPriorityBadge(item.priority) },
      { key: 'status', label: 'Status', render: (item) => getStatusBadge(item.status) },
    ];

    // Only admin and managers can see assignment information
    if (user.role !== 'Employee') {
      baseColumns.splice(2, 0, {
      key: 'assigned_to', 
      label: 'Assigned To',
      render: (item) => `${item.assigned_to_first_name} ${item.assigned_to_last_name}`
      });
    }

    return baseColumns;
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Check if user is an employee (not admin or manager)
      if (user.role === 'Employee') {
        // Find the employee ID for this user
        const employeeRes = await axios.get('http://localhost:5000/api/employees');
        const currentEmployee = employeeRes.data.find(emp => emp.user_id === user.id);
        
        if (currentEmployee) {
          // Get only tasks assigned to this employee
          const response = await axios.get(`http://localhost:5000/api/tasks/employee/${currentEmployee.employee_id}`);
          setTasks(response.data);
        }
      } else {
        // Admin or manager can see all tasks
      const response = await axios.get('http://localhost:5000/api/tasks');
      setTasks(response.data);
      }
    } catch (error) {
      toast.error('Error fetching tasks');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
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
    fetchTasks();
    if (user.role !== 'Employee') {
      fetchProjects();
      fetchEmployees();
    }
  }, [user.role]);

  const handleAdd = () => {
    setSelectedTask(null);
    setFormData({
      project_id: '',
      task_name: '',
      description: '',
      deadline: '',
      status: 'Pending',
      priority: 'Medium',
      assigned_to: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    
    if (user.role === 'Employee') {
      // Employees can only update status
      setFormData({
        project_id: task.project_id,
        task_name: task.task_name,
        description: task.description || '',
        deadline: task.deadline,
        status: task.status,
        priority: task.priority,
        assigned_to: task.assigned_to
      });
    } else {
      // Managers and admins can edit all fields
      const formattedDate = new Date(task.deadline).toISOString().split('T')[0];
      setFormData({
        project_id: task.project_id,
        task_name: task.task_name,
        description: task.description || '',
        deadline: formattedDate,
        status: task.status,
        priority: task.priority,
        assigned_to: task.assigned_to
      });
    }
    
    setIsModalOpen(true);
  };

  const handleDelete = async (task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/tasks/${task.task_id}`);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Task deleted successfully');
        await fetchTasks(); // Wait for the fetch to complete
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.response?.data?.error || 'Error deleting task');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.task_name?.trim()) {
        toast.error('Task name is required');
        return;
      }
      if (!formData.project_id) {
        toast.error('Project is required');
        return;
      }
      if (!formData.assigned_to) {
        toast.error('Assigned employee is required');
        return;
      }
      if (!formData.deadline) {
        toast.error('Deadline is required');
        return;
      }

      if (selectedTask) {
        if (user.role === 'Employee') {
          // Employees can only update status
          const response = await axios.put(
            `http://localhost:5000/api/tasks/${selectedTask.task_id}`,
            { status: formData.status }
          );
          if (response.data.error) {
            throw new Error(response.data.error);
          }
        } else {
          // Managers and admins can update all fields
          const response = await axios.put(
            `http://localhost:5000/api/tasks/${selectedTask.task_id}`,
            formData
          );
          if (response.data.error) {
            throw new Error(response.data.error);
          }
        }
        toast.success('Task updated successfully');
      } else {
        const response = await axios.post('http://localhost:5000/api/tasks', formData);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Task added successfully');
      }
      setIsModalOpen(false);
      await fetchTasks(); // Wait for the fetch to complete
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error saving task');
    }
  };

  // Check user role for permissions
  const canAdd = user?.role !== 'Employee';
  const canEdit = true; // All roles can edit, but employees have limited edit capabilities
  const canDelete = user?.role === 'Admin';

  // Employee task form is simplified
  const renderEmployeeTaskForm = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Task Details</h3>
        <p><span className="font-medium">Project:</span> {selectedTask?.project_name}</p>
        <p><span className="font-medium">Task:</span> {selectedTask?.task_name}</p>
        <p><span className="font-medium">Description:</span> {selectedTask?.description || 'No description provided'}</p>
        <p><span className="font-medium">Deadline:</span> {formatDate(selectedTask?.deadline)}</p>
        <p><span className="font-medium">Priority:</span> {selectedTask?.priority}</p>
      </div>
      
      <div className="pt-4 border-t">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Update Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );

  // Full task form for managers and admins
  const renderFullTaskForm = () => (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="task_name"
          className="block text-sm font-medium text-gray-700"
        >
          Task Name
        </label>
        <input
          type="text"
          id="task_name"
          value={formData.task_name}
          onChange={(e) =>
            setFormData({ ...formData, task_name: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="project_id"
          className="block text-sm font-medium text-gray-700"
        >
          Project
        </label>
        <select
          id="project_id"
          value={formData.project_id}
          onChange={(e) =>
            setFormData({ ...formData, project_id: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.project_id} value={project.project_id}>
              {project.project_name}
            </option>
          ))}
        </select>
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
          htmlFor="assigned_to"
          className="block text-sm font-medium text-gray-700"
        >
          Assigned To
        </label>
        <select
          id="assigned_to"
          value={formData.assigned_to}
          onChange={(e) =>
            setFormData({ ...formData, assigned_to: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Employee</option>
          {employees.map((employee) => (
            <option key={employee.employee_id} value={employee.employee_id}>
              {`${employee.first_name} ${employee.last_name}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="deadline"
          className="block text-sm font-medium text-gray-700"
        >
          Deadline
        </label>
        <input
          type="date"
          id="deadline"
          value={formData.deadline}
          onChange={(e) =>
            setFormData({ ...formData, deadline: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="priority"
          className="block text-sm font-medium text-gray-700"
        >
          Priority
        </label>
        <select
          id="priority"
          value={formData.priority}
          onChange={(e) =>
            setFormData({ ...formData, priority: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">
          {user.role === 'Employee' 
            ? 'View and update your assigned tasks' 
            : 'Manage your organization\'s tasks'}
        </p>
      </div>

      <DataTable
        columns={getColumns()}
        data={tasks}
        onEdit={canEdit ? handleEdit : null}
        onDelete={canDelete ? handleDelete : null}
        onAdd={canAdd ? handleAdd : null}
        title={user.role === 'Employee' ? 'My Tasks' : 'Task List'}
        isLoading={isLoading}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={
          user.role === 'Employee' 
            ? 'Update Task Status' 
            : (selectedTask ? 'Edit Task' : 'Add New Task')
        }
      >
        {user.role === 'Employee' ? renderEmployeeTaskForm() : renderFullTaskForm()}
      </FormModal>
    </div>
  );
};

export default Tasks; 