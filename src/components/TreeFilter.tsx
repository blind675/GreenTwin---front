'use client';

import React from 'react';

interface TreeFilterProps {
  onFilterChange: (filters: { status: string[], types: string[] }) => void;
  selectedFilters: { status: string[], types: string[] };
}

const TreeFilter: React.FC<TreeFilterProps> = ({ onFilterChange, selectedFilters }) => {
  const statusOptions = ['Sănătos', 'Necesită atenție', 'Critic'];

  const handleStatusChange = (status: string) => {
    let newStatus: string[];

    if (selectedFilters.status.includes(status)) {
      // If status is already selected, remove it
      newStatus = selectedFilters.status.filter(s => s !== status);
    } else {
      // Otherwise add it
      newStatus = [...selectedFilters.status, status];
    }

    onFilterChange({ ...selectedFilters, status: newStatus });
  };

  const handleTypeChange = (type: string) => {
    let newTypes: string[];

    if (selectedFilters.types.includes(type)) {
      // If type is already selected, remove it
      newTypes = selectedFilters.types.filter(t => t !== type);
    } else {
      // Otherwise add it
      newTypes = [...selectedFilters.types, type];
    }

    onFilterChange({ ...selectedFilters, types: newTypes });
  };

  return (
    <div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white border-opacity-30 shadow-lg">
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-black mb-2">Filtru stare copaci</h3>
      </div>

      <div className="flex flex-col space-y-2">
        {/* Status options with colored circles */}
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <button
            onClick={() => handleStatusChange('Sănătos')}
            className={`text-sm text-gray-800 hover:text-green-700 bg-transparent border-none cursor-pointer py-1 ${selectedFilters.status.includes('Sănătos') ? 'font-bold' : ''}`}
          >
            Sănătos
          </button>
        </div>

        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
          <button
            onClick={() => handleStatusChange('Necesită atenție')}
            className={`text-sm text-gray-800 hover:text-orange-700 bg-transparent border-none cursor-pointer py-1 ${selectedFilters.status.includes('Necesită atenție') ? 'font-bold' : ''}`}
          >
            Necesită atenție
          </button>
        </div>

        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
          <button
            onClick={() => handleStatusChange('Critic')}
            className={`text-sm text-gray-800 hover:text-red-700 bg-transparent border-none cursor-pointer py-1 ${selectedFilters.status.includes('Critic') ? 'font-bold' : ''}`}
          >
            Critic
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => onFilterChange({ ...selectedFilters, status: [] })}
          className="text-sm text-gray-700 underline bg-transparent border-none cursor-pointer py-1 hover:text-blue-600"
        >
          Șterge filtrele
        </button>
        <div className="text-sm text-gray-600">
          {selectedFilters.status.length === 0
            ? 'Niciun filtru aplicat'
            : `Filtrare după: ${selectedFilters.status.join(', ')}`}
        </div>
      </div>
    </div>
  );
};

export default TreeFilter;
