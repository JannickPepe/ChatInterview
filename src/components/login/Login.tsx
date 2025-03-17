import React, { useState } from "react";
import ChatService from "../../lib/ChatService";

interface LoginProps {
  // Called when the user successfully logs in.
  // The parent can store both token and username in state or context.
  onLogin: (token: string, username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      // Calls your server: /authenticate
      const { token } = await ChatService.authenticate(username, password);

      // Pass both token and the typed username to the parent
      onLogin(token, username);
    } catch (err) {
      // If authentication fails or an error occurs
      setErrorMessage("Invalid username or password");
      console.error("Login failed", err);
    }
  };

  return (
    <div className="max-w-xs mx-auto p-4 border border-gray-200 rounded mt-12">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <div>
          <label className="block text-sm font-semibold">Username</label>
          <input
            className="border w-full p-1 rounded"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Password</label>
          <input
            className="border w-full p-1 rounded"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>
        {errorMessage && (
          <p className="text-red-600 text-sm">{errorMessage}</p>
        )}
        <button
          type="submit"
          className="bg-indigo-600 text-white py-1 rounded hover:bg-indigo-700"
        >
          Log In
        </button>
      </form>
    </div>
  );
};

export default Login;
