import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layouts
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Guards
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import EmployeeRoute from './components/EmployeeRoute'

// Public Pages
import Landing from './pages/Landing'
import Listings from './pages/Listings'
import PropertyDetail from './pages/PropertyDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Login from './pages/Login'
import Register from './pages/Register'

// User Portal
import Dashboard from './pages/Dashboard'

// Admin Panel
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminMessages from './pages/admin/AdminMessages'
import AdminDocuments from './pages/admin/AdminDocuments'
import CreateAdmin from './pages/admin/CreateAdmin'
import AdminProperties from './pages/admin/AdminProperties'
import AdminEmployees from './pages/admin/AdminEmployees'

// Employee Panel
import EmployeeLayout from './pages/employee/EmployeeLayout'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import PendingProperties from './pages/employee/PendingProperties'
import PropertyReview from './pages/employee/PropertyReview'

// Error Pages
import NotFound from './pages/NotFound'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Loading EliteEstate…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        {/* Admin Routes — isolated layout, no Navbar/Footer */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="create-admin" element={<CreateAdmin />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="employees" element={<AdminEmployees />} />
        </Route>

        {/* Employee Panel Routes — isolated layout */}
        <Route
          path="/employee/*"
          element={
            <EmployeeRoute>
              <EmployeeLayout />
            </EmployeeRoute>
          }
        >
          <Route index element={<EmployeeDashboard />} />
          <Route path="pending" element={<PendingProperties />} />
          <Route path="pending/:id" element={<PropertyReview />} />
        </Route>

        {/* Public Routes — with Navbar & Footer */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/listings" element={<Listings />} />
                  <Route path="/listings/:id" element={<PropertyDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  )
}

export default App
