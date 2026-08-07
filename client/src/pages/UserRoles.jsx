import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UserRoles = () => {
  const [userRoles, setUserRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    user_id: '',
    role: 'Employee'
  });

  const fetchUserRoles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/user-roles');
      setUserRoles(response.data);
    } catch (error) {
      toast.error('Error fetching user roles');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await axios.get('http://localhost:5000/api/users');
      console.log('Users response:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      toast.error('Error fetching users. Please try again.');
    }
  };

  useEffect(() => {
    fetchUserRoles();
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setSelectedRole(null);
    setFormData({
      user_id: '',
      role: 'Employee'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setFormData({
      user_id: role.user_id,
      role: role.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (role) => {
    if (window.confirm('Are you sure you want to delete this role assignment?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/user-roles/${role.role_id}`);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Role assignment deleted successfully');
        await fetchUserRoles();
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.response?.data?.error || 'Error deleting role assignment');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.user_id) {
        toast.error('User is required');
        return;
      }
      if (!formData.role) {
        toast.error('Role is required');
        return;
      }

      if (selectedRole) {
        const response = await axios.put(
          `http://localhost:5000/api/user-roles/${selectedRole.role_id}`,
          formData
        );
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Role assignment updated successfully');
      } else {
        const response = await axios.post('http://localhost:5000/api/user-roles', formData);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Role assignment added successfully');
      }
      setIsModalOpen(false);
      await fetchUserRoles();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error saving role assignment');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      Admin: 'bg-red-100 text-red-800',
      Manager: 'bg-blue-100 text-blue-800',
      Employee: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role]}`}>
        {role}
      </span>
    );
  };

  const columns = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (item) => getRoleBadge(item.role) }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <DataTable
        columns={columns}
        data={userRoles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        title="User Roles"
        addButtonText="Assign Role"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={selectedRole ? 'Edit Role Assignment' : 'Assign Role'}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="user_id"
              className="block text-sm font-medium text-gray-700"
            >
              User
            </label>
            <select
              id="user_id"
              value={formData.user_id}
              onChange={(e) =>
                setFormData({ ...formData, user_id: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {`${user.first_name} ${user.last_name} (${user.email})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default UserRoles; 