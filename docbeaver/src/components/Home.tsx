// src/components/Home.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../logo.png";

const Home: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo rounded-xl mb-3" alt="logo" />
        <p className="text-3xl">DocBeaver</p>
        <p className="mt-3 w-3/4 text-xl">
          Welcome to DocBeaver, your reliable document management solution. 
          Whether you need to store, organize, or share your documents, 
          DocBeaver has got you covered. <Link to="/signup" className="App-link">Sign up</Link> now to start managing your documents effortlessly.
        </p>
        <div className="mt-4">
          <p>Already have an account?</p>
          <Link to="/login" className="App-link">
            Log in here
          </Link>
        </div>
      </header>
    </div>
  );
};

export default Home;
