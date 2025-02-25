import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Registration from './registration';
import Login from './login';

function App() {
  // Toggle state to switch between Login and Registration views
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="App">
      <header className="App-header">
        {/* Conditionally render Login or Registration */}
        {showLogin ? <Login /> : <Registration />}
        {/* Button to switch between forms */}
        <button
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#5563DE',
            color: '#fff',
            cursor: 'pointer'
          }}
          onClick={() => setShowLogin(!showLogin)}
        >
          {showLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </header>
    </div>
  );
}

export default App;

