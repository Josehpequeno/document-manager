// src/components/Login.tsx

import React, { useState } from "react";
import logo from "../logo.png";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para lidar com o envio do formulário
    console.log("Email/Username:", emailOrUsername);
    console.log("Password:", password);
  };

  return (
    <div className="App-header h-screen">
      <form
        className="bg-gray-100 text-slate-950 shadow-md rounded px-8 pt-4 pb-4 mb-4 mt-4"
        onSubmit={handleSubmit}
      >
        <Link to="/" className="flex justify-center">
          <img src={logo} className="App-logo rounded" alt="logo" />
        </Link>
        <div className="mb-4 mt-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="emailOrUsername"
          >
            Email/Username:
          </label>

          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            id="emailOrUsername"
            value={emailOrUsername}
            placeholder="Username or Email"
            onChange={(e) => setEmailOrUsername(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password:
          </label>

          {/*className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"*/}
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="******************"
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="md:flex md:items-center mb-6">
            <div className="md:w-1/3"></div>
            <label className="md:w-2/3 block text-gray-500 font-bold">
              <input
                className=" mr-2 leading-tight accent-slate-900"
                type="checkbox"
                onClick={handleShowPassword}
              />
              <span className="text-sm">
                {showPassword ? "Hide" : "Show"} Password
              </span>
            </label>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            className="bg-slate-900 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Login
          </button>
        </div>
        <div className="mt-2 text-sm flex gap-1 justify-center">
          <p>Don't have an account? </p>
          <Link to="/signup" className=" text-slate-400 hover:text-primary">
            {" "}
            Create one here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
