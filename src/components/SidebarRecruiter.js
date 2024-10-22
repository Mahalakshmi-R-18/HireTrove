// src/components/SidebarRecruiter.js
import React from 'react';

const SidebarRecruiter = ({ isOpen, onMenuItemClick }) => {
  return (
    <aside className={`bg-fuchsia-950 text-white w-64 min-h-screen p-4 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <h2 className="text-xl font-bold mb-4">Recruiter Menu</h2>
      <ul>
        <li>
          <button
            onClick={() => onMenuItemClick('recruitment-posting')}
            className="block p-2 rounded hover:bg-fuchsia-800 w-full text-left"
          >
            Requirements Posting
          </button>
        </li>
        <li>
          <button
            onClick={() => onMenuItemClick('search-users')}
            className="block p-2 rounded hover:bg-fuchsia-800 w-full text-left"
          >
            Search for Users
          </button>
        </li>
        <li>
          <button
            onClick={() => onMenuItemClick('hiring-history')}
            className="block p-2 rounded hover:bg-fuchsia-800 w-full text-left"
          >
            Your Hirings
          </button>
        </li>
        <li>
          <button
            onClick={() => onMenuItemClick('posted-requirements')}
            className="block p-2 rounded hover:bg-fuchsia-800 w-full text-left"
          >
            Posted Requirement 
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default SidebarRecruiter;
