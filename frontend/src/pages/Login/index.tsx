import React, { useState } from "react";
import logo from "../../logo.png";
import { Link, Navigate } from "react-router-dom";
import axios from "../../utils/axios";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { setUser } from "../../store/userSlice";

export default function Login() {
  const dispatch = useAppDispatch();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAppSelector((state) => state.userState.user);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/login`, {
        password,
        username_or_email: usernameOrEmail,
      });
      dispatch(
        setUser({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          ...response.data.user,
        }),
      );
    } catch (error) {
      setError("Invalid username/email or password");
    }
  };

  if (user) {
    return <Navigate to="/home" replace={true} />;
  }

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
            htmlFor="usernameOrEmail"
          >
            Email/Username:
          </label>

          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            id="usernameOrEmail"
            value={usernameOrEmail}
            placeholder="Username or Email"
            onChange={(e) => setUsernameOrEmail(e.target.value)}
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
        {error && (
          <div
            className="text-xs md:text-sm flex gap-1 justify-center bg-red-100 border border-red-400 text-red-700 px-2 py-2 rounded relative mt-4"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
      </form>
    </div>
  );
}
