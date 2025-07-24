import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Map from './components/Map'
import AuthPage from './pages/Auth'
import AdminPage from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
// Styles are imported in main.tsx

function App() {
  return (
    <Router>
      <div className="flex flex-col h-full w-full">
        <Header />
        <main className="flex-1 h-full w-full overflow-hidden">
          <Routes>
            <Route path="/" element={<Map />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
