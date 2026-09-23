import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import toast from 'react-hot-toast';
import { StatusLabel } from '../components/StatusLabel';

const Payroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    employee_id: '',
    salary_month: '',
    basic_salary: '',
    deductions: '0.00',
    payment_status: 'Pending'
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => (
    <StatusLabel status={status} tone={status === 'Paid' ? 'green' : 'yellow'} />
  );

  const fetchPayroll = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/payroll');
      setPayroll(response.data);
    } catch (error) {
      toast.error('Error fetching payroll records');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchPayroll();
    fetchEmployees();
  }, []);

  const handleAdd = () => {
    setSelectedRecord(null);
    setFormData({
      employee_id: '',
      salary_month: '',
      basic_salary: '',
      deductions: '0.00',
      payment_status: 'Pending'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      employee_id: record.employee_id,
      salary_month: record.salary_month,
      basic_salary: record.basic_salary,
      deductions: record.deductions || '0.00',
      payment_status: record.payment_status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (record) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      try {
        const response = await axios.delete(`/api/payroll/${record.payroll_id}`);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Payroll record deleted successfully');
        await fetchPayroll();
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.response?.data?.error || 'Error deleting payroll record');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.employee_id) {
        toast.error('Employee is required');
        return;
      }
      if (!formData.salary_month) {
        toast.error('Salary month is required');
        return;
      }
      if (!formData.basic_salary) {
        toast.error('Basic salary is required');
        return;
      }

      if (selectedRecord) {
        const response = await axios.put(
          `/api/payroll/${selectedRecord.payroll_id}`,
          formData
        );
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Payroll record updated successfully');
      } else {
        const response = await axios.post('/api/payroll', formData);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Payroll record added successfully');
      }
      setIsModalOpen(false);
      await fetchPayroll();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error saving payroll record');
    }
  };

  const columns = [
    { key: 'employee_name', label: 'Employee' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'salary_month', label: 'Month' },
    { key: 'basic_salary', label: 'Basic salary', render: (item) => formatCurrency(item.basic_salary) },
    { key: 'deductions', label: 'Deductions', render: (item) => formatCurrency(item.deductions) },
    { key: 'net_salary', label: 'Net salary', render: (item) => formatCurrency(item.net_salary) },
    { key: 'payment_status', label: 'Status', render: (item) => getStatusBadge(item.payment_status) }
  ];

  return (
    <div>
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={payroll}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        title="Payroll"
        addButtonText="Add payroll entry"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={selectedRecord ? 'Edit Payroll' : 'Add Payroll'}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="employee_id"
              className="block text-sm font-medium text-gray-700"
            >
              Employee
            </label>
            <select
              id="employee_id"
              value={formData.employee_id}
              onChange={(e) =>
                setFormData({ ...formData, employee_id: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.employee_id} value={employee.employee_id}>
                  {`${employee.first_name} ${employee.last_name} - ${employee.department}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="salary_month"
              className="block text-sm font-medium text-gray-700"
            >
              Salary Month
            </label>
            <input
              type="month"
              id="salary_month"
              value={formData.salary_month}
              onChange={(e) =>
                setFormData({ ...formData, salary_month: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="basic_salary"
              className="block text-sm font-medium text-gray-700"
            >
              Basic Salary
            </label>
            <input
              type="number"
              id="basic_salary"
              value={formData.basic_salary}
              onChange={(e) =>
                setFormData({ ...formData, basic_salary: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label
              htmlFor="deductions"
              className="block text-sm font-medium text-gray-700"
            >
              Deductions
            </label>
            <input
              type="number"
              id="deductions"
              value={formData.deductions}
              onChange={(e) =>
                setFormData({ ...formData, deductions: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label
              htmlFor="payment_status"
              className="block text-sm font-medium text-gray-700"
            >
              Payment Status
            </label>
            <select
              id="payment_status"
              value={formData.payment_status}
              onChange={(e) =>
                setFormData({ ...formData, payment_status: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Payroll; 