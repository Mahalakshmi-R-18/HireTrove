import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu'; 
import CloseIcon from '@mui/icons-material/Close'; 
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'; 
import { Link } from 'react-router-dom';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="bg-fuchsia-900 text-white p-4 w-full shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <WorkOutlineIcon fontSize="large" className="mr-2" />
          <h1 className="text-2xl font-bold font-custom">HireTrove</h1>
        </div>
        <div className="relative">
          {/* Hamburger Menu Icon */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white focus:outline-none p-2"
          >
            {menuOpen ? <CloseIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
          </button>

          {/* Navigation Menu */}
          <nav
            className={`absolute top-16 right-0 w-full max-w-xs bg-fuchsia-950 text-white md:bg-transparent md:static md:w-auto md:flex md:items-center md:space-x-4 transition-transform transform md:translate-x-0 ${
              menuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ zIndex: 1000 }}
          >
            <ul className="flex flex-col md:flex-row md:space-x-4 text-lg md:text-base space-y-4 md:space-y-0 p-6 md:p-0 items-center md:items-start">
              <li><a href="/#home" className="hover:text-fuchsia-300 transition-colors text-center">Home</a></li>
              <li><a href="/#about" className="hover:text-fuchsia-300 transition-colors text-center">About</a></li>
              <li><Link to="/signup" className="hover:text-fuchsia-300 transition-colors text-center">Register</Link></li>
              <li><Link to="/login" className="hover:text-fuchsia-300 transition-colors text-center">Login</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
