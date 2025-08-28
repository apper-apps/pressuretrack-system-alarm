import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import AddReading from "@/components/pages/AddReading";
import ChartView from "@/components/pages/ChartView";
import Medications from "@/components/pages/Medications";
import Profile from "@/components/pages/Profile";
import Export from "@/components/pages/Export";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-reading" element={<AddReading />} />
            <Route path="chart" element={<ChartView />} />
            <Route path="medications" element={<Medications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="export" element={<Export />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </BrowserRouter>
  );
}

export default App;