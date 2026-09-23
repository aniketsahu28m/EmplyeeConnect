import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import toast from 'react-hot-toast';
import { StatusLabel } from '../components/StatusLabel';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    status: 'Present'
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status) => <StatusLabel status={status} />;

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/attendance');
      setAttendance(response.data);
    } catch (error) {
      toast.error('Error fetching attendance records');
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
    fetchAttendance();
    fetchEmployees();
  }, []);

  const handleAdd = () => {
    setSelectedRecord(null);
    setFormData({
      employee_id: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Present'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      employee_id: record.employee_id,
      date: record.date,
      status: record.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (record) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        const response = await axios.delete(`/api/attendance/${record.attendance_id}`);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Attendance record deleted successfully');
        await fetchAttendance();
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.response?.data?.error || 'Error deleting attendance record');
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
      if (!formData.date) {
        toast.error('Date is required');
        return;
      }
      if (!formData.status) {
        toast.error('Status is required');
        return;
      }

      if (selectedRecord) {
        const response = await axios.put(
          `/api/attendance/${selectedRecord.attendance_id}`,
          formData
        );
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Attendance record updated successfully');
      } else {
        const response = await axios.post('/api/attendance', formData);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Attendance record added successfully');
      }
      setIsModalOpen(false);
      await fetchAttendance();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error saving attendance record');
    }
  };

  const columns = [
    { key: 'employee_name', label: 'Employee' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'date', label: 'Date', render: (item) => formatDate(item.date) },
    { key: 'status', label: 'Status', render: (item) => getStatusBadge(item.status) }
  ];

  return (
    <div>
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={attendance}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        title="Attendance"
        addButtonText="Record attendance"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={selectedRecord ? 'Edit Attendance' : 'Add Attendance'}
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
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
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
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Attendance; 