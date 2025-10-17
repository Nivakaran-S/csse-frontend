"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:8000/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: This ensures cookies are sent and received
        body: JSON.stringify({ userName, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      console.log("Login response:", data);

      const role = data.role;
      console.log("User role:", role);

      if (role) {
        switch (role) {
          case "Doctor":
            router.push("/doctor");
            break;
          case "Patient":
            router.push("/patient");
            break;
          case "Admin":
            router.push("/admin");
            break;
          default:
            router.push("/");
        }
      } else {
        setError("No role assigned to user.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[89vh] w-[500px] flex items-center justify-center py-[1rem]">
      <div className="flex items-center justify-center w-[100%] max-w-[400px] h-[60vh] bg-white rounded-[1rem] border-[0.15px] border-[#101010] overflow-hidden">
        <div className="flex flex-col items-center justify-center py-[2rem] px-[1.5rem] w-[100%] max-w-[320px]">
          <h2 className="text-[1.9rem] mb-[0.2rem] text-[#101010]">Welcome Back:)</h2>

          {error && (
            <div className="w-full text-red-600 text-sm mb-[1rem] p-2 bg-red-50 rounded border border-red-200">
              {error}
            </div>
          )}

          <form className="w-[100%] flex flex-col gap-[1rem]" onSubmit={handleLogin}>
            <div className="flex flex-col gap-[0.25rem]">
              <label className="text-[#1D1D1D] text-[1rem]" htmlFor="userName">
                Email
              </label>
              <input
                type="text"
                id="userName"
                className="py-[0.6rem] px-[0.8rem] rounded-[0.5rem] ring-[0.8px] ring-[#101010] bg-white text-black outline-none focus:ring-[#808080]"
                placeholder="Enter your username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="flex flex-col gap-[0.25rem]">
              <label className="text-[#1D1D1D] text-[1rem]" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="py-[0.6rem] px-[0.8rem] w-[100%] rounded-[0.5rem] ring-[0.8px] ring-[#101010] bg-white text-black outline-none focus:ring-[#808080]"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-[8px] text-[0.75rem] cursor-pointer text-[#101010] hover:text-[#808080] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-[100%] py-[0.4rem] cursor-pointer bg-[#FFA00A] text-black rounded-[0.5rem] hover:bg-black hover:text-white transition-[0.2s] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-[0.5rem] text-center text-[#9ca3af] text-[0.8rem]">
            <Link href="/register" className="text-[#60a5fa] hover:text-black">
              Create account
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}