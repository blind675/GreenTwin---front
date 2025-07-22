'use client';

import React, { useState } from 'react';
import { Tree } from '../services/api';

interface TreeDetailsProps {
  tree: Tree | null;
  onClose: () => void;
}

const TreeDetails: React.FC<TreeDetailsProps> = ({ tree, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'actions'>('info');
  
  if (!tree) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'needs attention':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTabClass = (tab: 'info' | 'history' | 'actions') => {
    return activeTab === tab
      ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
      : 'text-gray-500 hover:text-gray-700';
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-lg shadow-lg z-30 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-bold text-lg">{tree.type} Tree</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex border-b">
        <button
          className={`flex-1 py-2 text-center ${getTabClass('info')}`}
          onClick={() => setActiveTab('info')}
        >
          Info
        </button>
        <button
          className={`flex-1 py-2 text-center ${getTabClass('history')}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`flex-1 py-2 text-center ${getTabClass('actions')}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'info' && (
          <>
            <div className="mb-4">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tree.status)}`}>
                {tree.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-medium">{tree.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Species:</span>
                <span className="font-medium">{tree.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{tree.lat.toFixed(4)}, {tree.lng.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Planted:</span>
                <span className="font-medium">{tree.lastUpdated || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Inspection:</span>
                <span className="font-medium">{tree.lastUpdated || 'Unknown'}</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="border-l-2 border-green-500 pl-3 py-1">
              <div className="text-sm text-gray-500">June 15, 2025</div>
              <div className="font-medium">Regular Inspection</div>
              <div className="text-sm">Tree is healthy and growing well.</div>
            </div>
            <div className="border-l-2 border-orange-500 pl-3 py-1">
              <div className="text-sm text-gray-500">May 2, 2025</div>
              <div className="font-medium">Minor Issue Found</div>
              <div className="text-sm">Some signs of pest activity on lower branches.</div>
            </div>
            <div className="border-l-2 border-blue-500 pl-3 py-1">
              <div className="text-sm text-gray-500">April 10, 2025</div>
              <div className="font-medium">Maintenance</div>
              <div className="text-sm">Pruned and fertilized.</div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-3">
            <button className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Detailed Report
            </button>
            <button className="w-full py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report Issue
            </button>
            <button className="w-full py-2 px-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Maintenance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeDetails;
