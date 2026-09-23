import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import toast from 'react-hot-toast';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department: '',
    designation: '',
    salary: '',
    date_of_joining: '',
  });

  const columns = [
    {
      key: 'first_name',
      label: 'Name',
      render: (item) => `${item.first_name} ${item.last_name}`,
      searchValue: (item) => `${item.first_name} ${item.last_name}`,
    },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    {
      key: 'salary',
      label: 'Salary',
      render: (item) => `$${parseFloat(item.salary).toLocaleString()}`,
    },
    {
      key: 'date_of_joining',
      label: 'Joined',
      render: (item) =>
        item.date_of_joining
          ? new Date(item.date_of_joining).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : '—',
    },
  ];

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      toast.error('Error fetching employees');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAdd = () => {
    setSelectedEmployee(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      department: '',
      designation: '',
      salary: '',
      date_of_joining: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    const formattedDate = new Date(employee.date_of_joining).toISOString().split('T')[0];
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      password: '', // Don't show password in edit mode
      department: employee.department,
      designation: employee.designation,
      salary: employee.salary,
      date_of_joining: formattedDate,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (employee) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`/api/employees/${employee.employee_id}`);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        toast.error('Error deleting employee');
        console.error('Error:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEmployee) {
        await axios.put(
          `/api/employees/${selectedEmployee.employee_id}`,
          formData
        );
        toast.success('Employee updated successfully');
      } else {
        await axios.post('/api/employees', formData);
        toast.success('Employee added successfully');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (error) {
      toast.error('Error saving employee');
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        isLoading={isLoading}
        subtitle="Everyone on the payroll, with their department and joining date."
        columns={columns}
        data={employees}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        title="Employees"
        addButtonText="Add employee"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          {!selectedEmployee && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required={!selectedEmployee}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700"
            >
              Department
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="designation"
              className="block text-sm font-medium text-gray-700"
            >
              Designation
            </label>
            <input
              type="text"
              id="designation"
              value={formData.designation}
              onChange={(e) =>
                setFormData({ ...formData, designation: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="salary"
              className="block text-sm font-medium text-gray-700"
            >
              Salary
            </label>
            <input
              type="number"
              id="salary"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="date_of_joining"
              className="block text-sm font-medium text-gray-700"
            >
              Date of Joining
            </label>
            <input
              type="date"
              id="date_of_joining"
              value={formData.date_of_joining}
              onChange={(e) =>
                setFormData({ ...formData, date_of_joining: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Employees; 