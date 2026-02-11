"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    toast.success("Account created successfully 🎉");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* LEFT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 relative">
        <div className="absolute inset-0 bg-green-500/5 blur-3xl rounded-full"></div>

        <div className="relative w-full max-w-md backdrop-blur-xl bg-white/70 shadow-2xl rounded-2xl p-8 border border-green-100">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-green-700">
              Join Life Leaf 🌿
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Secure your vehicle with smart QR identity
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="h-11"
              required
            />

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

            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="h-11"
              required
            />

            <Button className="w-full h-11 bg-green-600 hover:bg-green-700 transition-all duration-300 shadow-lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-green-700 font-semibold">
              Login
            </a>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-green-700"></div>

        <div className="relative z-10 text-white text-center px-12">
          <h2 className="text-4xl font-bold mb-4">Smarter Vehicle Safety</h2>
          <p className="text-lg opacity-90">
            Connect instantly. Protect privacy. Save lives.
          </p>
        </div>

        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-10 left-10"></div>
        <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl bottom-10 right-10"></div>
      </div>
    </div>
  );
}
