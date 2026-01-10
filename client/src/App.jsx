import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BookDetails from './pages/BookDetails'
import Settings from './pages/Settings'
import Modal from './components/Modal/Modal'
import BookSearch from './components/BookSearch/BookSearch'
import ProtectedRoute from './components/ProtectedRoute'
import { useBooks } from './contexts/BooksContext'
import { useAuth } from './contexts/AuthContext'

import Navbar from './components/Navbar/Navbar'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { fetchBooks } = useBooks()
  const { user } = useAuth()

  const handleBookAdded = () => {
    fetchBooks()
    setIsModalOpen(false)
  }

  return (
    <div className="app">
      {user && <Navbar onAddBook={() => setIsModalOpen(true)} />}

      <main className="container" style={{ marginTop: '20px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/book/:id" element={<ProtectedRoute><BookDetails /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add a New Book">
        <BookSearch onBookAdded={handleBookAdded} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default App
