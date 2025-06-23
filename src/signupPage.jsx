import React, { use } from 'react';
import { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid'; // Import CheckIcon for the features list
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

          function LogIn() {
            const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
            const [email,setEmail] = useState('');
            const [password,setPassword] = useState('');
            const [error,setError]= useState('');
            const [showPasswordInput, setShowPasswordInput] = useState(false);
            const [message, setMessage] = useState('');
            const navigate = useNavigate();
            function handleEmailContinue(e) {
                e.preventDefault();
                if (!email) {
                  setError('Please enter a valid email.');
                  return;
                }
                setError('');
                setShowPasswordInput(true); // Show password field
              }
              
        function validatePassword(password) {
            // Add your password validation logic here
            const length = password.length>=8;
            const Uppercase = /[A-Z]/.test(password);
            const Lowercase = /[a-z]/.test(password);
            const Number = /[0-9]/.test(password);
            const SpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            switch (true) {
                case !length:
                  setError('Password must be at least 8 characters long.');
                  return false;
                case !Uppercase:
                  setError('Password must contain at least one uppercase letter.');
                  return false;
                case !Lowercase:
                  setError('Password must contain at least one lowercase letter.');
                  return false;
                case !Number:
                  setError('Password must contain at least one number.');
                  return false;
                case !SpecialCharacter:
                  setError('Password must contain at least one special character.');
                  return false;
                default:
                  setError(''); // Clear any previous errors
                  return true;
              }
        }
        async function handleSubmit(e) {
            e.preventDefault();
            if (validatePassword(password)) {
                try {
                    const response = await axios.post("http://localhost:8000/api/signup", {
                        withCredentials: true,
                        email: email,
                        password: password
                    },{
                    headers: {
                        "Content-Type": "application/json"
                }});
                   
                navigate("/login");
                } catch (error) {
                  if (error.response?.status === 400) {
                    setError("This email is already registered. Try logging in instead.");
                  } else {
                    setError("Something went wrong. Please try again.");
                  }
                }
            }
        }
    
          
            return (
                <div>
                <header className="absolute inset-x-0 top-0 z-50">
                <div className="flex items-center lg:flex-1 ml-8 mt-6">
            <a href="/#" className="flex items-center">
              <img
                src="/logo.png"
                alt="Interview AI Logo"
                className=" h-12 w-12 " // Makes the logo round
                />
              <span className="text-2xl font-sans">Interview AI</span>
            </a>
          </div>
        
              </header>
            
              <div className="flex items-center justify-center min-h-screen">
  <div className="flex flex-col items-center justify-center w-full max-w-sm p-6 rounded-lg ">
    <img
      src="/logo.png"
      alt="Interview AI Logo"
      className="mb-2 h-20 w-20 rounded-full"
    />
    <h1 className="text-2xl font-sans mb-4">Create an account</h1>
    <form onSubmit={showPasswordInput ? handleSubmit : handleEmailContinue} className="flex flex-col items-center gap-4 w-64">
  <input
    type="email"
    placeholder="Email Address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full p-2 border border-gray-300 rounded-md"
  />

  {!showPasswordInput && (
    <button
      type="submit"
      className="w-full bg-indigo-600 text-white font-sans py-2 rounded-md hover:bg-indigo-500"
    >
      Continue
    </button>
  )}
    
    

    <AnimatePresence>
  {showPasswordInput && (
    <motion.div
      key="passwordField"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 1 }}
      className="w-full flex flex-col gap-4"
    >
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={(e) => handleSubmit(e)}
        type="submit"
        className="w-full bg-indigo-600 text-white font-sans py-2 rounded-md hover:bg-indigo-500"
      >
        Sign Up
      </button>
    </motion.div>
  )}
</AnimatePresence>
  <span className="flex-items  px-1 text-gray-500">Already have an account?     <a href="/login" className="text-indigo-600 hover:underline">
      Log In
    </a></span>

        <div className="flex items-center justify-center w-full my-1">
      <div className="h-px w-full bg-gray-300"></div>
      <span className="px-2 text-gray-500">Or</span>
      <div className="h-px w-full bg-gray-300"></div>
    </div>
    <button className="w-full  bg-black text-white font-sans py-2 rounded-md hover:bg-stone-800">
      Continue with Googlelogo
    </button>
    <button className="w-full  bg-black text-white font-sans py-2 rounded-md hover:bg-stone-800">
      Continue with Apple
    </button>
    <button className="w-full  bg-black text-white font-sans py-2 rounded-md hover:bg-stone-800">
      Continue with microsoftlogo
    </button>
      
    </form>
  </div>
</div>
</div>
    )

          }
export default LogIn