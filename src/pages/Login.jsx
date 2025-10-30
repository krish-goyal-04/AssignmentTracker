import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfessors, getStudents } from "../utils/storage";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
//used shadcn card and button componenet along with usestate to manage state

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const { loginUser } = useContext(AppContext);
  const [error, setError] = useState(null);

  //const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email, password, role);
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
    //navigate(`/${role}/${userDetails.id}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-700/90 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm"
      >
        <Card className="bg-white shadow-md rounded-xl border">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="border p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  className="border p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium">Role</label>
                <select
                  className="border p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  onChange={(e) => setRole(e.target.value)}
                  value={role}
                >
                  <option className="rounded-2xl" value="student">
                    Student
                  </option>
                  <option value="professor">Professor</option>
                </select>
              </div>

              <Button className="w-full rounded-lg py-2 text-sm" type="submit">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
