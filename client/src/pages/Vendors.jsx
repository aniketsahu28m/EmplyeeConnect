import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import toast from 'react-hot-toast';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    address: ''
  });

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/vendors');
      setVendors(response.data);
    } catch (error) {
      toast.error('Error fetching vendors');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAdd = () => {
    setSelectedVendor(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company_name: '',
      address: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      company_name: vendor.company_name,
      address: vendor.address
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (vendor) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        const response = await axios.delete(`/api/vendors/${vendor.vendor_id}`);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Vendor deleted successfully');
        await fetchVendors();
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.response?.data?.error || 'Error deleting vendor');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.name?.trim()) {
        toast.error('Name is required');
        return;
      }
      if (!formData.email?.trim()) {
        toast.error('Email is required');
        return;
      }
      if (!formData.phone?.trim()) {
        toast.error('Phone is required');
        return;
      }
      if (!formData.company_name?.trim()) {
        toast.error('Company name is required');
        return;
      }
      if (!formData.address?.trim()) {
        toast.error('Address is required');
        return;
      }

      if (selectedVendor) {
        const response = await axios.put(
          `/api/vendors/${selectedVendor.vendor_id}`,
          formData
        );
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Vendor updated successfully');
      } else {
        const response = await axios.post('/api/vendors', formData);
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        toast.success('Vendor added successfully');
      }
      setIsModalOpen(false);
      await fetchVendors();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error saving vendor');
    }
  };

  const columns = [
    { key: 'name', label: 'Contact name' },
    { key: 'company_name', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' }
  ];

  return (
    <div>
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={vendors}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        title="Vendors"
        addButtonText="Add vendor"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={selectedVendor ? 'Edit Vendor' : 'Add Vendor'}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Contact Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="company_name"
              className="block text-sm font-medium text-gray-700"
            >
              Company Name
            </label>
            <input
              type="text"
              id="company_name"
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
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

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Vendors; 