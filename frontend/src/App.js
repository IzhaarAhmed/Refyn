import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ReviewDetail from './components/ReviewDetail';
import CreateReview from './components/CreateReview';
import Profile from './components/Profile';
import GitHubImport from './components/GitHubImport';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/review/:id" element={<ReviewDetail />} />
          <Route path="/create-review" element={<CreateReview />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/github" element={<GitHubImport />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;