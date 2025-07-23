import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
    
      <div className="container max-w-[1200px] mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="/Logo.png"
            alt="Municipiul Timișoara Logo"
            className="w-auto mr-2"
            style={{ height: '50px' }}
          />
          <h1 className="text-md font-bold text-white">Municipiul Timișoara</h1>
        </div>
        <nav className="flex items-center">
          <span className="mr-4 text-white">Contul meu</span>
          <Link
            to="/auth"
            className="bg-white text-green-700 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Conectare
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
