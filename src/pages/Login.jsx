import React, { useContext, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProfessors, getStudents } from "../utils/storage";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const { loginUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const list = role === "student" ? getStudents() : getProfessors();
    const userDetails = list.find(
      (u) => u.email === email && u.password === password
    );

    if (!userDetails) {
      setEmail("");
      setPassword("");
      return alert("Invalid Credentials");
    }
    const data = { id: userDetails?.id, email, role };
    loginUser(data);
    navigate(`/${role}/${userDetails.id}`);
  };

  return (
    <div className="flex min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-200 px-4">
      <div className="flex flex-1 items-center justify-center py-12">
        {/* Login card */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <Card className="bg-white shadow-xl border border-slate-200 overflow-hidden">
            {/* Header with subtle brand bar */}
            <div className="bg-linear-to-r from-slate-800 to-slate-600 p-8 text-center">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block mb-4"
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border-4 border-white/30 shadow-lg">
                  <span className="text-3xl">📚</span>
                </div>
              </Motion.div>
              <Motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Assignment Tracker
              </Motion.h1>
              <Motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 text-sm"
              >
                Sign in to manage your assignments
              </Motion.p>
            </div>

            {/* Form section */}
            <div className="p-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Role selector with tabs (no icons) */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all ${
                      role === "student"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("professor")}
                    className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all ${
                      role === "professor"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Professor
                  </button>
                </div>

                {/* Email field (no icon) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Password field (no icon) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {/* Submit button */}
                <Button
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg text-base font-semibold shadow-sm hover:shadow-md transition-all"
                  type="submit"
                >
                  Sign In →
                </Button>
              </form>

              {/* Demo credentials */}
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  💡 Demo Credentials:
                </p>
                <div className="space-y-1 text-xs text-slate-600">
                  <p>
                    <strong>Student:</strong> riya@student.com / riya123
                  </p>
                  <p>
                    <strong>Professor:</strong> raj@joineazy.com / raj123
                  </p>
                </div>
              </Motion.div>
            </div>
          </Card>
        </Motion.div>
      </div>
    </div>
  );
};

export default Login;
