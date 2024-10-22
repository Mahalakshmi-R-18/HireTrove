import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Assuming you're using react-icons for the password visibility toggle
import userManagementImg from '../images/userManagement.jpg'; 
import clubManagementImg from '../images/clubManagement.jpg';
import userPostManagementImg from '../images/userPostManagement.jpg';
import ClubManagement from './AdminSkillManagement';
import UserPostManagement from './AdminContentManagement';

const AdminDashboardWelcome = () => {
  const [selectedPage, setSelectedPage] = useState('');
  const [selectedSubPage, setSelectedSubPage] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', category: '', skills: [], dob: '', age: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]); // Fetch or set this based on your application state
  const [selectedUser, setSelectedUser] = useState(null);
  const [editableUser, setEditableUser] = useState({ name: '', email: '', category: '', skills: [], dob: '', age: '' });

  const categories = ['member', 'admin']; // Example categories
  const availableSkills = ['Skill 1', 'Skill 2', 'Skill 3']; // Example skills

  const handlePageSelect = (page) => {
    setSelectedPage(page);
    setSelectedSubPage(''); // Reset subpage when changing main page
  };

  const handleSubPageChange = (subPage) => {
    setSelectedSubPage(subPage);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = () => {
    console.log('User created:', newUser);
    // Add user creation logic here
  };

  const handleUserSelection = (e) => {
    const userId = e.target.value;
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
    if (user) {
      setEditableUser(user);
    }
  };

  const handleUpdateUser = () => {
    console.log('User updated:', editableUser);
    // Add user update logic here
  };

  const handleDeleteUser = () => {
    console.log('User deleted:', selectedUser);
    // Add user deletion logic here
  };

  const renderPageContent = () => {
    switch (selectedPage) {
      case 'user-management':
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4">User Management</h1>
            <div className="flex space-x-4 mb-4">
              <button onClick={() => handleSubPageChange('create-user')} className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors">
                Create User
              </button>
              <button onClick={() => handleSubPageChange('read-user')} className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors">
                View Users
              </button>
              <button onClick={() => handleSubPageChange('update-user')} className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors">
                Update User
              </button>
              <button onClick={() => handleSubPageChange('delete-user')} className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors">
                Delete User
              </button>
            </div>
            {/* Render form for Create, Update, and Delete User */}
          </div>
        );
      case 'club-management':
        return <ClubManagement />;
      case 'user-post-management':
        return <UserPostManagement />;
      default:
        return renderWelcomePage(); // Default welcome page
    }
  };

  const renderWelcomePage = () => (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-4xl font-bold mb-24">Welcome to Admin Dashboard!</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <img src={userManagementImg} alt="User Management" className="rounded-lg mb-4 w-full h-40 object-cover" />
          <button 
            onClick={() => handlePageSelect('user-management')} 
            className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors w-full"
          >
            User Management
          </button>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <img src={clubManagementImg} alt="Club Management" className="rounded-lg mb-4 w-full h-40 object-cover" />
          <button 
            onClick={() => handlePageSelect('club-management')} 
            className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors w-full"
          >
            Club Management
          </button>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <img src={userPostManagementImg} alt="User Post Management" className="rounded-lg mb-4 w-full h-40 object-cover" />
          <button 
            onClick={() => handlePageSelect('user-post-management')} 
            className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors w-full"
          >
            User Post Management
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {renderPageContent()}
    </div>
  );
};

export default AdminDashboardWelcome;
