import React from 'react'
import Hero from './Hero'
import './App.css'
import InterviewPage from './InterviewPage'
import SetupInterview from './setupInterviewPage'
import SignUp from './signupPage'
import Login from './logIn'
import CveExtraction from './cvExtraction'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/InterviewPage" element={<InterviewPage />} />
        <Route path="/setupInterviewPage" element={<SetupInterview />} />
        <Route path="/signupPage" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cvExtraction" element={<CveExtraction />} />

      </Routes>
    </Router>
  )
}

export default App
