import React, { useState } from "react";
import logo from "../logo.png";
import { Link } from "react-router-dom";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [username, setUsername] = useState("");
  const [usernameValid, setUsernameValid] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordNotEmpty, setPasswordNotEmpty] = useState(true);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar se o email é válido
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailPattern.test(email));

    // Verificar se o username tem pelo menos 4 caracteres
    setUsernameValid(username.length >= 4);

    // Verificar se a senha não está vazia
    setPasswordNotEmpty(password.trim() !== "");

    // Verificar se as senhas correspondem
    setPasswordsMatch(password === confirmPassword);

    // Se todos os campos forem válidos, continue com o envio do formulário
    if (emailValid && usernameValid && passwordsMatch) {
      // Lógica para lidar com o envio do formulário
      console.log("Email:", email);
      console.log("Username:", username);
      console.log("Password:", password);
      console.log("Confirm Password:", confirmPassword);
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
            htmlFor="username"
          >
            Username:
          </label>

          <input
            className={`shadow appearance-none border ${
              usernameValid ? "" : "border-red-500"
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            type="text"
            id="username"
            value={username}
            placeholder="Username"
            onChange={(e) => {
              setUsernameValid(true);
              setUsername(e.target.value);
            }}
          />
          {!usernameValid && (
            <p className="text-red-500 text-xs italic">
              Username must be at least 4 characters long.
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
          {!passwordNotEmpty && (
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
        </div>
        {!passwordsMatch && (
          <p className="text-red-500 text-xs italic">Passwords do not match.</p>
        )}
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
            disabled={!emailValid || !usernameValid || !passwordsMatch} // Desabilita o botão de envio se algum dos campos não for válido
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
      </form>
    </div>
  );
};

export default Signup;
