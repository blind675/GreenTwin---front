'use client';

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-green-500 text-white px-4 flex justify-center items-center sticky top-0 left-0 right-0 z-50 shadow-md w-full" style={{ backgroundColor: '#00A651', height: '80px' }}>
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
            href="/auth"
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
