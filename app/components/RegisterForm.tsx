"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistrationForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.gender) {
      setError("Please select a gender");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Username validation
    if (formData.userName.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare registration data (exclude confirmPassword)
      const { confirmPassword, ...registrationData } = formData;

      // Patient registration endpoint
      const endpoint = "http://localhost:8000/api/user/register/patient";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      console.log("Registration successful:", data);
      setSuccess(true);

      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[89vh] relative top-[-20px] flex-col w-[100%] flex items-center justify-center py-[1rem] px-[0px] pt-[70px]">
        <div className="flex items-center justify-center w-[100%] max-w-[500px] h-[60vh] bg-white rounded-[1rem] border-[1.5px] border-[#101010] overflow-hidden">
          <div className="text-center p-8">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-[#101010] mb-4">
              Registration Successful!
            </h2>
            <p className="text-[#1D1D1D] mb-6">
              Your Patient account has been created successfully. Redirecting you to login...
            </p>
            <Link
              href="/login"
              className="inline-block py-[0.6rem] px-[1.5rem] bg-[#FFA00A] text-black hover:text-white ring-[0.5px] ring-black rounded-[0.5rem] text-[1rem] cursor-pointer hover:bg-black transition-[0.2s]"
            >
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[89vh] relative top-[-20px] flex-col w-[100%] flex items-center justify-center py-[1rem] px-[0px] pt-[70px]">
      <div className="flex items-center justify-center w-[100%] max-w-[600px] bg-white rounded-[1rem] ring-[0.5px] ring-[#101010] overflow-hidden">
        <div className="flex flex-col items-center w-full justify-center py-[2rem] px-[1.5rem]">
          <div className="w-[100%] flex flex-col max-w-[450px]">
            <h2 className="text-[1.9rem] mb-[0.5rem] text-[#101010] text-center">
              Create Patient Account
            </h2>

            {error && (
              <div className="error-message p-3 mb-4 bg-red-100 text-red-700 rounded-md border border-red-300">
                {error}
              </div>
            )}

            <form
              className="w-[100%] flex flex-col gap-[1rem]"
              onSubmit={handleSubmit}
            >
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-[0.25rem]">
                  <label
                    className="text-[#1D1D1D] text-[1rem]"
                    htmlFor="firstName"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="py-[0.6rem] px-[0.8rem] focus:ring-[#808080] rounded-[0.5rem] ring-[0.75px] ring-[#374151] bg-white text-black text-[0.9rem] outline-none transition-[0.2s]"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div className="flex flex-col gap-[0.25rem]">
                  <label
                    className="text-[#1D1D1D] text-[1rem]"
                    htmlFor="lastName"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="py-[0.6rem] px-[0.8rem] focus:ring-[#808080] rounded-[0.5rem] ring-[0.75px] ring-[#101010] bg-white text-black text-[0.9rem] outline-none transition-[0.2s]"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-[0.25rem]">
                <label className="text-[#1D1D1D] text-[1rem]" htmlFor="userName">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  className="py-[0.6rem] px-[0.8rem] focus:ring-[#808080] rounded-[0.5rem] ring-[0.75px] ring-[#101010] bg-white text-black text-[0.9rem] outline-none transition-[0.2s]"
                  placeholder="johndoe"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  minLength={3}
                />
                <small className="text-gray-500 text-xs">
                  Minimum 3 characters
                </small>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-[0.25rem]">
                <label className="text-[#1D1D1D] text-[1rem]" htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="py-[0.6rem] px-[0.8rem] focus:ring-[#808080] rounded-[0.5rem] ring-[0.75px] ring-[#101010] bg-white text-black text-[0.9rem] outline-none transition-[0.2s]"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-[0.25rem]">
                <label
                  className="text-[#1D1D1D] text-[1rem]"
                  htmlFor="phoneNumber"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className="py-[0.6rem] px-[0.8rem] focus:ring-[#808080] rounded-[0.5rem] ring-[0.75px] ring-[#101010] bg-white text-black text-[0.9rem] outline-none transition-[0.2s]"
                  placeholder="+1234567890"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-[0.25rem]">
                <label className="text-[#1D1D1D] text-[1rem]">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center text-black">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === "Male"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Male
                  </label>
                  <label className="flex items-center text-black">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === "Female"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Female
                  </label>
                  <label className="flex items-center text-black">
                    <input
                      type="radio"
                      name="gender"
                      value="Other"
                      checked={formData.gender === "Other"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Other
                  </label>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-[0.25rem]">
                  <label
                    className="text-[#1D1D1D] text-[1rem]"
                    htmlFor="password"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="py-[0.6rem] px-[0.8rem] w-[100%] focus:ring-[#808080] rounded-[0.5rem] ring-[0.75px] ring-[#101010] bg-white text-black text-[0.9rem] outline-none transition-[0.2s]"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="ml-[0.5rem] hover:text-[#808080] bg-none border-none text-[#101010] text-[0.75rem] cursor-pointer padding-0 transition-[0.2s] absolute right-[8px]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <small className="text-gray-500 text-xs">
                    Minimum 6 characters
                  </small>
                </div>

                <div className="flex flex-col gap-[0.25rem]">
                  <label
                    className="text-[#1D1D1D] text-[1rem]"
                    htmlFor="confirmPassword"
                  >
                    Confirm <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="py-[0.6rem] px-[0.8rem] w-[100%] focus:ring-[#808080] rounded-[0.5rem] ring-[0.75px] ring-[#101010] bg-white text-black text-[0.9rem] outline-none transition-[0.2s]"
                      placeholder="Confirm"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="ml-[0.5rem] hover:text-[#808080] bg-none border-none text-[#101010] text-[0.75rem] cursor-pointer padding-0 transition-[0.2s] absolute right-[8px]"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-[100%] py-[0.6rem] bg-[#FFA00A] text-black hover:text-white ring-[0.5px] ring-black rounded-[0.5rem] text-[1rem] cursor-pointer mt-[0.5rem] hover:bg-black transition-[0.2s] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Patient Account"}
              </button>
            </form>
            <div className="mt-[0.5rem] text-center text-[0.8rem]">
              <p className="text-black">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#60a5fa] hover:text-black"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}