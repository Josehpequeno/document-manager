import React, { useState } from "react";
import logo from "../../logo.png";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [name, setName] = useState("");
  const [nameValid, setNameValid] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordIsEmpty, setPasswordIsEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<Boolean | undefined>(
    undefined
  );

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValidate = emailPattern.test(email);
    const nameValidate = name.length >= 4;
    const passwordIsEmptyValidate = password.trim() === "";
    const passwordsMatchValidate = password === confirmPassword;
    setEmailValid(emailValidate);
    setNameValid(nameValidate);
    setPasswordIsEmpty(passwordIsEmptyValidate);
    setPasswordsMatch(passwordsMatchValidate);

    if (
      emailValidate &&
      nameValidate &&
      !passwordIsEmptyValidate &&
      passwordsMatchValidate
    ) {
      try {
        await axios.post(`/users`, {
          email,
          name,
          password
        });
        setRequestSuccess(true);
        setError(null);
      } catch (error: any) {
        setError(error.response.data.error);
        setRequestSuccess(false);
      }
    }
  };

  return (
    <div className="App-header h-screen">
      <form
        className="bg-gray-100 text-slate-950 shadow-md rounded px-8 pt-4 pb-4 mt-4 mb-4"
        onSubmit={handleSubmit}
      >
        <Link to="/" className="flex justify-center">
          <img src={logo} className="App-logo rounded" alt="logo" />
        </Link>
        <div className="mb-4 mt-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email:
          </label>

          <input
            className={`shadow appearance-none border ${
              emailValid ? "" : "border-red-500"
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            type="email"
            id="email"
            value={email}
            placeholder="Email"
            onChange={(e) => {
              setEmailValid(true);
              setEmail(e.target.value);
            }}
          />
          {!emailValid && (
            <p className="text-red-500 text-xs italic">
              Please enter a valid email address.
            </p>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            name:
          </label>

          <input
            className={`shadow appearance-none border ${
              nameValid ? "" : "border-red-500"
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            type="text"
            id="name"
            value={name}
            placeholder="name"
            onChange={(e) => {
              setNameValid(true);
              setName(e.target.value);
            }}
          />
          {!nameValid && (
            <p className="text-red-500 text-xs italic">
              name must be at least 4 characters long.
            </p>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password:
          </label>

          <input
            className={`shadow appearance-none border ${
              passwordsMatch ? "" : "border-red-500"
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordIsEmpty && (
            <p className="text-red-500 text-xs italic">
              Please enter a password.
            </p>
          )}
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="confirmPassword"
          >
            Confirm Password:
          </label>

          <input
            className={`shadow appearance-none border ${
              passwordsMatch ? "" : "border-red-500"
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordsMatch(password === e.target.value);
            }}
          />
          {!passwordsMatch && (
            <p className="text-red-500 text-xs italic">
              Passwords do not match.
            </p>
          )}
        </div>
        <div className="md:flex md:items-center mb-6">
          <div className="md:w-1/3"></div>
          <label className="md:w-2/3 block text-gray-500 font-bold">
            <input
              className="mr-2 leading-tight accent-slate-900"
              type="checkbox"
              onClick={handleShowPassword}
            />
            <span className="text-sm">
              {showPassword ? "Hide" : "Show"} Password
            </span>
          </label>
        </div>
        <div className=" flex justify-center">
          <button
            className="bg-slate-900 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={!emailValid || !nameValid || !passwordsMatch} // Desabilita o botão de envio se algum dos campos não for válido
          >
            Signup
          </button>
        </div>
        <div className="mt-2 text-sm flex gap-1 justify-center">
          <p>Already have an account? </p>
          <Link to="/login" className=" text-slate-400 hover:text-primary">
            {" "}
            Log in here
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
        {requestSuccess && (
          <div
            className="text-xs md:text-sm flex gap-1 justify-center bg-green-100 border border-green-400 text-green-700 px-2 py-2 rounded relative mt-4"
            role="alert"
          >
            <strong className="font-bold">Success</strong>
            <span className="block sm:inline">
              {" "}
              User {name} created with success
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
