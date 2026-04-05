"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "customer" | "employee";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("customer");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("customerID", String(data.user.id));
      localStorage.setItem(
        "customerName",
        `${data.user.firstName} ${data.user.lastName}`,
      );
      localStorage.setItem("role", data.role);

      if (data.role === "employee") {
        localStorage.setItem("employeeID", String(data.user.id));
        localStorage.setItem("hotelID", String(data.user.hotelId));
      }

      router.push(role === "customer" ? "/customer" : "/employee");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
        <div className="hidden md:block w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
            alt="Luxury Hotel Lobby"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-8 text-white">
            <h2 className="text-2xl font-bold">Welcome to Restly</h2>
            <p className="text-sm opacity-90">
              Experience seamless hotel management and booking.
            </p>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Restly
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              To book and manage hotel rooms, at an ease
            </p>
          </div>

          <h2 className="text-base font-medium text-gray-800 mb-5">
            Sign in as a
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role selector */}
            <div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    role === "customer"
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Customer
                </button>

                <button
                  type="button"
                  onClick={() => setRole("employee")}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    role === "employee"
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Employee
                </button>
              </div>
            </div>

            {/* Email / ID Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
              >
                {role === "customer" ? "Customer ID / SIN" : "Employee ID"}
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "customer" ? "e.g. 123456789" : "e.g. EMP10001"
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
