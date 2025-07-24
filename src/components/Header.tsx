import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, isAuthenticated } from '../services/auth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container max-w-[1200px] mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="/Logo-white.png"
            alt="Green Twin Logo"
            className="w-auto mr-2"
            style={{ height: '50px' }}
          />
          <h1 className="text-md font-bold text-white">Green Twin</h1>
        </div>
        <nav className="flex items-center">
          {isLoggedIn && currentUser ? (
            <>
              <span className="mr-4 text-white">
                {currentUser.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-green-700 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Deconectare
              </button>
            </>
          ) : (
            <>
              <span className="mr-4 text-white">Contul meu</span>
              <Link
                to="/auth"
                className="bg-white text-green-700 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Conectare
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
