"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    toast.success("Login successful 🚀");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* LEFT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 relative">
        <div className="absolute inset-0 bg-green-500/5 blur-3xl rounded-full"></div>

        <div className="relative w-full max-w-md backdrop-blur-xl bg-white/70 shadow-2xl rounded-2xl p-8 border border-green-100">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-green-700">
              Welcome Back 🌿
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Login to manage your vehicle QR
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="h-11"
              required
            />

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="h-11"
              required
            />

            <Button className="w-full h-11 bg-green-600 hover:bg-green-700 transition-all duration-300 shadow-lg">
              Login
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <a href="/register" className="text-green-700 font-semibold">
              Sign Up
            </a>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - DESIGN PANEL */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-green-700"></div>

        <div className="relative z-10 text-white text-center px-12">
          <h2 className="text-4xl font-bold mb-4">Secure. Smart. Private.</h2>
          <p className="text-lg opacity-90">
            Connect instantly without revealing your phone number.
          </p>
        </div>

        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-10 left-10"></div>
        <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl bottom-10 right-10"></div>
      </div>
    </div>
  );
}
