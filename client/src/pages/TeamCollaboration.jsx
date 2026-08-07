import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FaUsers,
  FaComments,
  FaFileAlt,
  FaPaperPlane,
  FaCloudUploadAlt,
  FaUserPlus,
  FaPlus,
} from 'react-icons/fa';
import FormModal from '../components/FormModal';
import toast from 'react-hot-toast';

const TeamCollaboration = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [teams, setTeams] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Form states
  const [teamFormData, setTeamFormData] = useState({
    team_name: '',
    description: '',
    team_lead_id: '',
    members: [],
  });

  const [fileFormData, setFileFormData] = useState({
    file_name: '',
    file_url: '',
    file_type: '',
    description: '',
    uploaded_by: '',
  });

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees');
      setEmployees(response.data);
      
      // If we have user data and it's the first load, try to find the employee record
      if (user && !selectedEmployee && response.data.length > 0) {
        const currentUserEmployee = response.data.find(emp => emp.user_id === user.id);
        if (currentUserEmployee) {
          setFileFormData({ ...fileFormData, uploaded_by: currentUserEmployee.employee_id });
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchSharedFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/shared_files');
      setSharedFiles(response.data);
    } catch (error) {
      console.error('Error fetching shared files:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedEmployee) return;
    
    try {
      // Find the current user's employee ID
      const currentUserEmployee = employees.find(emp => emp.user_id === user.id);
      
      if (currentUserEmployee) {
        const response = await axios.get(`http://localhost:5000/api/messages?sender_id=${currentUserEmployee.employee_id}&receiver_id=${selectedEmployee.employee_id}`);
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchTeams();
    fetchSharedFiles();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchMessages();
    }
  }, [selectedEmployee]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedEmployee) return;
    
    try {
      setIsLoading(true);
      
      // Find the current user's employee ID
      const currentUserEmployee = employees.find(emp => emp.user_id === user.id);
      
      if (currentUserEmployee) {
        await axios.post('http://localhost:5000/api/messages', {
          sender_id: currentUserEmployee.employee_id,
          receiver_id: selectedEmployee.employee_id,
          message: messageText
        });
        
        setMessageText('');
        fetchMessages();
        toast.success('Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await axios.post('http://localhost:5000/api/teams', teamFormData);
      toast.success('Team created successfully');
      setIsTeamModalOpen(false);
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await axios.post('http://localhost:5000/api/shared_files', fileFormData);
      toast.success('File uploaded successfully');
      setIsFileModalOpen(false);
      fetchSharedFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessagesTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Employees</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {employees.map((employee) => (
            <div
              key={employee.employee_id}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                selectedEmployee?.employee_id === employee.employee_id
                  ? 'bg-blue-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedEmployee(employee)}
            >
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                  {employee.first_name[0]}
                </div>
                <div>
                  <p className="font-medium">{`${employee.first_name} ${employee.last_name}`}</p>
                  <p className="text-sm text-gray-500">{employee.designation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow md:col-span-3 flex flex-col">
        {selectedEmployee ? (
          <>
            <div className="border-b p-4">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                  {selectedEmployee.first_name[0]}
                </div>
                <div>
                  <p className="font-medium">{`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}</p>
                  <p className="text-sm text-gray-500">{selectedEmployee.designation}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto max-h-[400px]">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isSentByCurrentUser = msg.sender_id === employees.find(emp => emp.user_id === user.id)?.employee_id;
                    
                    return (
                      <div
                        key={msg.message_id}
                        className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isSentByCurrentUser
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p className={`text-xs mt-1 ${isSentByCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages yet. Start a conversation!</p>
                </div>
              )}
            </div>

            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !messageText.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <FaComments className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an employee to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeamsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Teams</h3>
        <button
          onClick={() => {
            setTeamFormData({
              team_name: '',
              description: '',
              team_lead_id: '',
              members: [],
            });
            setIsTeamModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <FaPlus className="mr-2" /> Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.team_id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-blue-500 text-white p-4">
              <h4 className="text-lg font-semibold">{team.team_name}</h4>
              <p className="text-sm text-blue-100">Lead: {team.team_lead_name || 'Unassigned'}</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">{team.description}</p>
              <div className="flex items-center space-x-2">
                <FaUsers className="text-gray-500" />
                <span className="text-sm text-gray-500">Members</span>
              </div>
              <button className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                <FaUserPlus className="mr-2" /> Add Member
              </button>
            </div>
          </div>
        ))}

        {teams.length === 0 && (
          <div className="col-span-3 bg-white rounded-lg shadow p-8 text-center">
            <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No teams created yet</p>
            <button
              onClick={() => {
                setTeamFormData({
                  team_name: '',
                  description: '',
                  team_lead_id: '',
                  members: [],
                });
                setIsTeamModalOpen(true);
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaPlus className="mr-2" /> Create Team
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderFilesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shared Files</h3>
        <button
          onClick={() => {
            const currentUserEmployee = employees.find(emp => emp.user_id === user.id);
            setFileFormData({
              file_name: '',
              file_url: '',
              file_type: '',
              description: '',
              uploaded_by: currentUserEmployee?.employee_id || '',
            });
            setIsFileModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <FaCloudUploadAlt className="mr-2" /> Upload File
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Upload Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sharedFiles.map((file) => (
              <tr key={file.file_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaFileAlt className="mr-2 text-gray-500" />
                    <div className="text-sm font-medium text-gray-900">{file.file_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{file.file_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{file.uploaded_by_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(file.uploaded_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}

            {sharedFiles.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No files have been shared yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Team Collaboration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Communicate with your team, share files, and manage team structures
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'messages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('messages')}
          >
            <div className="flex items-center">
              <FaComments className="mr-2" />
              Messages
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'teams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('teams')}
          >
            <div className="flex items-center">
              <FaUsers className="mr-2" />
              Teams
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'files'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('files')}
          >
            <div className="flex items-center">
              <FaFileAlt className="mr-2" />
              Shared Files
            </div>
          </button>
        </nav>
      </div>

      {activeTab === 'messages' && renderMessagesTab()}
      {activeTab === 'teams' && renderTeamsTab()}
      {activeTab === 'files' && renderFilesTab()}

      {/* Team Creation Modal */}
      <FormModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSubmit={handleCreateTeam}
        title="Create New Team"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="team_name" className="block text-sm font-medium text-gray-700">
              Team Name
            </label>
            <input
              type="text"
              id="team_name"
              value={teamFormData.team_name}
              onChange={(e) => setTeamFormData({ ...teamFormData, team_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={teamFormData.description}
              onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="team_lead_id" className="block text-sm font-medium text-gray-700">
              Team Lead
            </label>
            <select
              id="team_lead_id"
              value={teamFormData.team_lead_id}
              onChange={(e) => setTeamFormData({ ...teamFormData, team_lead_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select Team Lead</option>
              {employees.map((employee) => (
                <option key={employee.employee_id} value={employee.employee_id}>
                  {`${employee.first_name} ${employee.last_name}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormModal>

      {/* File Upload Modal */}
      <FormModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onSubmit={handleUploadFile}
        title="Upload File"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="file_name" className="block text-sm font-medium text-gray-700">
              File Name
            </label>
            <input
              type="text"
              id="file_name"
              value={fileFormData.file_name}
              onChange={(e) => setFileFormData({ ...fileFormData, file_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="file_url" className="block text-sm font-medium text-gray-700">
              File URL
            </label>
            <input
              type="url"
              id="file_url"
              value={fileFormData.file_url}
              onChange={(e) => setFileFormData({ ...fileFormData, file_url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              For demo purposes, please provide a URL to an existing file online.
            </p>
          </div>
          <div>
            <label htmlFor="file_type" className="block text-sm font-medium text-gray-700">
              File Type
            </label>
            <select
              id="file_type"
              value={fileFormData.file_type}
              onChange={(e) => setFileFormData({ ...fileFormData, file_type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select File Type</option>
              <option value="PDF">PDF</option>
              <option value="Document">Document</option>
              <option value="Spreadsheet">Spreadsheet</option>
              <option value="Presentation">Presentation</option>
              <option value="Image">Image</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={fileFormData.description}
              onChange={(e) => setFileFormData({ ...fileFormData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default TeamCollaboration; 