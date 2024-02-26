import React from "react";
import logo from "./logo.png";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo rounded-3xl mb-2" alt="logo" />
        <p className="text-3xl">DocBeaver</p>
        <small className="text-xs">Document Manager</small>
        <div className="mt-5 text-sm">
          <p>Don't have an account?</p>
          <a
            className="App-link "
            href="/createAccount"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create one here
          </a>
        </div>
        <div className="mt-2 text-sm">
          <p>Already have an account?</p>
          <a
            className="App-link"
            href="/login"
            target="_blank"
            rel="noopener noreferrer"
          >
            Log in here
          </a>
        </div>
      </header>
    </div>
  );
}

export default App;
