import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { auth } from '../firebase';
import UserProfile from './UserProfile'; // Import the UserProfile component

const HeaderMember = ({ onMenuClick }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileViewOpen, setIsProfileViewOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleProfileView = () => {
    setIsProfileViewOpen(true);
    setIsProfileMenuOpen(false);
  };

  const closeProfileView = () => {
    setIsProfileViewOpen(false);
  };

  return (
    <header className="bg-fuchsia-900 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="text-white">
          <MenuIcon />
        </button>
        <h1 className="text-xl font-bold ml-4">HireTrove</h1>
      </div>
      <div className="relative flex items-center">
        <button onClick={handleProfileClick} className="text-white flex items-center">
          <AccountCircleIcon />
        </button>
        {isProfileMenuOpen && (
          <div className="absolute top-12 right-0 bg-white text-black rounded shadow-lg flex flex-col">
            <button
              onClick={handleProfileView}
              className="px-4 py-2 hover:bg-gray-200 border-b border-gray-300 w-full text-left"
            >
              View Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 hover:bg-gray-200 w-full text-left"
            >
              Logout
            </button>
          </div>
        )}
        {isProfileViewOpen && <UserProfile onClose={closeProfileView} />}
      </div>
    </header>
  );
};

export default HeaderMember;
