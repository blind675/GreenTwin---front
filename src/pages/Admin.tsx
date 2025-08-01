import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAdmin, logout } from '../services/auth';
import { fetchTrees, fetchUsers, deleteTree, deleteTrees, updateTree, waterAllTrees, resetUserPassword } from '../services/api';
import type { Tree, User, UpdateTreeInput, ResetPasswordResponse } from '../services/api';

export default function AdminPage() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('trees'); // trees, users, stats
  const [isUpdateTreeModalOpen, setIsUpdateTreeModalOpen] = useState(false);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [updatedTreeData, setUpdatedTreeData] = useState<UpdateTreeInput>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isWateringAll, setIsWateringAll] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordResult, setResetPasswordResult] = useState<ResetPasswordResponse | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTreeIds, setSelectedTreeIds] = useState<number[]>([]);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is admin, redirect if not
  useEffect(() => {
    const checkAdmin = async () => {
      if (!isAdmin()) {
        navigate('/');
      } else {
        try {
          setLoading(true);
          // Fetch trees data
          const treeData = await fetchTrees();
          setTrees(treeData);
          
          // Fetch users data
          const userData = await fetchUsers();
          setUsers(userData);
        } catch (err) {
          console.error('Error:', err);
          setError(err instanceof Error ? err.message : 'Eroare la încărcarea datelor');
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkAdmin();
  }, [navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Handle tree deletion
  const handleDeleteTree = async (id: number) => {
    if (window.confirm('Sigur doriți să ștergeți acest copac?')) {
      try {
        setIsDeleting(true);
        const result = await deleteTree(id);
        setTrees(trees.filter(tree => tree.id !== id));
        // Clear selected trees if the deleted one was selected
        setSelectedTreeIds(prev => prev.filter(treeId => treeId !== id));
        setSuccessMessage(result.message || 'Copacul a fost șters cu succes!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error deleting tree:', err);
        setError(err instanceof Error ? err.message : 'Eroare la ștergerea copacului');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  // Handle batch deletion of trees
  const handleBatchDeleteTrees = async () => {
    if (selectedTreeIds.length === 0) {
      setError('Nu ați selectat niciun copac pentru ștergere');
      return;
    }
    
    if (window.confirm(`Sigur doriți să ștergeți ${selectedTreeIds.length} copaci selectați?`)) {
      try {
        setIsBatchDeleting(true);
        const result = await deleteTrees(selectedTreeIds);
        setTrees(trees.filter(tree => !selectedTreeIds.includes(tree.id)));
        setSelectedTreeIds([]);
        setSuccessMessage(result.message || `${result.count} copaci au fost șterși cu succes!`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error batch deleting trees:', err);
        setError(err instanceof Error ? err.message : 'Eroare la ștergerea copacilor selectați');
      } finally {
        setIsBatchDeleting(false);
      }
    }
  };
  
  // Handle tree selection toggle
  const handleTreeSelectionToggle = (id: number) => {
    setSelectedTreeIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(treeId => treeId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Handle select all trees
  const handleSelectAllTrees = () => {
    if (selectedTreeIds.length === trees.length) {
      // If all trees are selected, deselect all
      setSelectedTreeIds([]);
    } else {
      // Otherwise select all trees
      setSelectedTreeIds(trees.map(tree => tree.id));
    }
  };
  
  // Handle opening the update tree modal
  const handleOpenUpdateModal = (tree: Tree) => {
    setSelectedTree(tree);
    setUpdatedTreeData({
      name: tree.name,
      scientificName: tree.type,
      responsibleUserId: tree.responsibleUser?.id
    });
    setIsUpdateTreeModalOpen(true);
  };
  
  // Handle updating tree information
  const handleUpdateTree = async () => {
    if (!selectedTree) return;
    
    try {
      setLoading(true);
      await updateTree(selectedTree.id, updatedTreeData);
      
      // Refresh trees data
      const treeData = await fetchTrees();
      setTrees(treeData);
      
      setSuccessMessage('Copacul a fost actualizat cu succes!');
      setIsUpdateTreeModalOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating tree:', err);
      setError(err instanceof Error ? err.message : 'Eroare la actualizarea copacului');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle refresh trees data
  const handleRefreshTrees = async () => {
    try {
      setIsRefreshing(true);
      const treeData = await fetchTrees();
      setTrees(treeData);
      setSuccessMessage('Lista de copaci a fost actualizată cu succes!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error refreshing trees:', err);
      setError(err instanceof Error ? err.message : 'Eroare la actualizarea listei de copaci');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle water all trees
  const handleWaterAllTrees = async () => {
    if (window.confirm('Sigur doriți să udați toți copacii?')) {
      try {
        setIsWateringAll(true);
        const result = await waterAllTrees();
        
        // Refresh trees data
        const treeData = await fetchTrees();
        setTrees(treeData);
        
        setSuccessMessage(result.message || `${result.count} copaci au fost udați cu succes!`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error watering all trees:', err);
        setError(err instanceof Error ? err.message : 'Eroare la udarea tuturor copacilor');
      } finally {
        setIsWateringAll(false);
      }
    }
  };
  
  // Handle password reset
  const handleResetPassword = async (userId: number) => {
    if (window.confirm('Sigur doriți să resetați parola acestui utilizator?')) {
      try {
        setIsResettingPassword(true);
        const result = await resetUserPassword(userId);
        
        // Show the new password in a modal
        setResetPasswordResult(result);
        setIsPasswordModalOpen(true);
        
        setSuccessMessage(`Parola utilizatorului ${result.userName} a fost resetată cu succes!`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error resetting password:', err);
        setError(err instanceof Error ? err.message : 'Eroare la resetarea parolei');
      } finally {
        setIsResettingPassword(false);
      }
    }
  };
  
  // Handle copy password to clipboard
  const handleCopyPassword = () => {
    if (resetPasswordResult) {
      navigator.clipboard.writeText(resetPasswordResult.newPassword);
      alert('Parola a fost copiată în clipboard!');
    }
  };
  
  const user = getCurrentUser();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panou de Administrare</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Bine ai venit, {user?.name}</span>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Deconectare
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('trees')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trees'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Copaci
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Utilizatori
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Statistici
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {activeTab === 'trees' && (
          <div>
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Administrare Copaci
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Gestionați copacii din aplicație
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleRefreshTrees}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRefreshing ? 'Se actualizează...' : 'Actualizează'}
                </button>
                <button 
                  onClick={handleWaterAllTrees}
                  disabled={isWateringAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isWateringAll ? 'Se udă...' : 'Udă toți copacii'}
                </button>
                <button 
                  onClick={handleBatchDeleteTrees}
                  disabled={isBatchDeleting || selectedTreeIds.length === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {isBatchDeleting ? 'Se șterg...' : `Șterge (${selectedTreeIds.length})`}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedTreeIds.length > 0 && selectedTreeIds.length === trees.length}
                          onChange={handleSelectAllTrees}
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nume
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tip
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Locație
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ultima Udare
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilizator Responsabil
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trees.map((tree) => (
                    <tr key={tree.id} className={selectedTreeIds.includes(tree.id) ? 'bg-blue-50' : ''}>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={selectedTreeIds.includes(tree.id)}
                            onChange={() => handleTreeSelectionToggle(tree.id)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tree.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tree.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tree.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tree.lat.toFixed(6)}, {tree.lng.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${tree.status === 'Sănătos' ? 'bg-green-100 text-green-800' : 
                            tree.status === 'Necesită atenție' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {tree.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tree.lastWateredAt).toLocaleDateString('ro-RO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tree.responsibleUser ? tree.responsibleUser.name : 'Nealocat'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleOpenUpdateModal(tree)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Editare
                        </button>
                        <button 
                          onClick={() => handleDeleteTree(tree.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-900 disabled:text-red-300"
                        >
                          {isDeleting ? 'Se șterge...' : 'Ștergere'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div>
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Administrare Utilizatori
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Gestionați utilizatorii aplicației
              </p>
            </div>
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nume
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scor Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scor Lunar
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Înregistrării
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.imageUrl && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img className="h-10 w-10 rounded-full" src={user.imageUrl} alt={user.name} />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.totalScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.currentMonthScore || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('ro-RO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleResetPassword(user.id)}
                          disabled={isResettingPassword}
                          className="text-yellow-600 hover:text-yellow-900 disabled:text-yellow-300"
                        >
                          {isResettingPassword ? 'Se resetează...' : 'Resetare parolă'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Statistici
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Această secțiune va fi implementată în viitor
            </p>
          </div>
        )}
      </div>
      
      {/* Update Tree Modal */}
      {isUpdateTreeModalOpen && selectedTree && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Actualizare Copac #{selectedTree?.id}</h3>
              <button 
                onClick={() => setIsUpdateTreeModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Închide</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nume</label>
                <input
                  type="text"
                  id="name"
                  value={updatedTreeData.name || ''}
                  onChange={(e) => setUpdatedTreeData({...updatedTreeData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="scientificName" className="block text-sm font-medium text-gray-700">Nume Științific</label>
                <input
                  type="text"
                  id="scientificName"
                  value={updatedTreeData.scientificName || ''}
                  onChange={(e) => setUpdatedTreeData({...updatedTreeData, scientificName: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="responsibleUser" className="block text-sm font-medium text-gray-700">Utilizator Responsabil</label>
                <select
                  id="responsibleUser"
                  value={updatedTreeData.responsibleUserId || ''}
                  onChange={(e) => setUpdatedTreeData({...updatedTreeData, responsibleUserId: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selectează utilizator</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsUpdateTreeModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                onClick={handleUpdateTree}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isPasswordModalOpen && resetPasswordResult && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Parolă Nouă pentru {resetPasswordResult.userName}</h3>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Închide</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Noua parolă generată pentru utilizator:</p>
                <div className="flex items-center">
                  <div className="flex-grow bg-gray-100 p-3 rounded-l-md font-mono text-sm">
                    {resetPasswordResult.newPassword}
                  </div>
                  <button
                    onClick={handleCopyPassword}
                    className="bg-blue-600 text-white p-3 rounded-r-md hover:bg-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Vă rugăm să transmiteți această parolă utilizatorului prin email sau SMS. Utilizatorul va trebui să își schimbe parola după prima autentificare.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
