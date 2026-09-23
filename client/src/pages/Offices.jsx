import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import toast from 'react-hot-toast';

const Offices = () => {
  const [offices, setOffices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    office_name: '',
    location: '',
    manager_id: ''
  });

  const fetchOffices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/offices');
      setOffices(response.data);
    } catch (error) {
      toast.error('Error fetching offices');
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
    fetchOffices();
    fetchEmployees();
  }, []);

  const handleAdd = () => {
    setSelectedOffice(null);
    setFormData({
      office_name: '',
      location: '',
      manager_id: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (office) => {
    setSelectedOffice(office);
    setFormData({
      office_name: office.office_name,
      location: office.location,
      manager_id: office.manager_id || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (office) => {
    if (window.confirm('Are you sure you want to delete this office?')) {
      try {
        const response = await axios.delete(`/api/offices/${office.office_id}`);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Office deleted successfully');
        await fetchOffices();
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.response?.data?.error || 'Error deleting office');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.office_name?.trim()) {
        toast.error('Office name is required');
        return;
      }
      if (!formData.location?.trim()) {
        toast.error('Location is required');
        return;
      }

      if (selectedOffice) {
        const response = await axios.put(
          `/api/offices/${selectedOffice.office_id}`,
          formData
        );
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Office updated successfully');
      } else {
        const response = await axios.post('/api/offices', formData);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Office added successfully');
      }
      setIsModalOpen(false);
      await fetchOffices();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error saving office');
    }
  };

  const columns = [
    { key: 'office_name', label: 'Office name' },
    { key: 'location', label: 'Location' },
    { 
      key: 'manager_name', 
      label: 'Manager',
      render: (item) => item.manager_name || 'Not Assigned'
    }
  ];

  return (
    <div>
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={offices}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        title="Offices"
        addButtonText="Add office"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={selectedOffice ? 'Edit Office' : 'Add Office'}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="office_name"
              className="block text-sm font-medium text-gray-700"
            >
              Office Name
            </label>
            <input
              type="text"
              id="office_name"
              value={formData.office_name}
              onChange={(e) =>
                setFormData({ ...formData, office_name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="manager_id"
              className="block text-sm font-medium text-gray-700"
            >
              Manager
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
              {employees.map((employee) => (
                <option key={employee.employee_id} value={employee.employee_id}>
                  {`${employee.first_name} ${employee.last_name}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Offices; 