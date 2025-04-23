import React, {useState, useEffect} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Home from './pages/Home';
import ProtectedRoute from "../src/components/ProtectedRoute";

function App() {
  
  return (
    <BrowserRouter data-testid="browser-router">
      <Routes>
        <Route index element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              {/* We can put our routes that require user authentication to access here (likely just home for this assignment) */}
              <Home />
            </ProtectedRoute>
          }
        />
    </Routes>
    </BrowserRouter>
  );
}

export default App;