import React from 'react'
import Hero from './Hero'
import './App.css'
import InterviewPage from './InterviewPage'
import SetupInterview from './setupInterviewPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/InterviewPage" element={<InterviewPage />} />
        <Route path="/setupInterviewPage" element={<SetupInterview />} />
      </Routes>
    </Router>
  )
}

export default App
