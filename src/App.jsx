import React, { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./Login.jsx";
import Home from "./Home";
import { getToken, tokenKey } from "./Auth.js";

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = getToken(tokenKey);
    if (!token) { 
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} >
        </Route>
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </>
  );
}

export default App;
