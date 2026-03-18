import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import CategoryVideos from "./pages/CategoryVideos";
import VideoPlayer from "./pages/VideoPlayer";
import AdminDashboard from "./pages/AdminDashboard";
import UploadPodcast from "./pages/UploadPodcast";
import AdminLogin from "./pages/AdminLogin";
import AdminCategories from "./pages/AdminCategories";
import AdminVideos from "./pages/AdminVideos";
import AdminEditVideo from "./pages/AdminEditVideo";
import AdminComments from "./pages/AdminComments";

import AdminRoute from "./components/AdminRoute";
import Footer from "./components/Footer"; // Import the Footer

// Layout component to conditionally show footer
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <>
      {children}
      {/* Only show footer on non-admin routes */}
      {!isAdminRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<CategoryVideos />} />
          <Route path="/video/:id" element={<VideoPlayer />} />

          {/* Public admin login route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/upload"
            element={
              <AdminRoute>
                <UploadPodcast />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/videos"
            element={
              <AdminRoute>
                <AdminVideos />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <AdminRoute>
                <AdminEditVideo />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/comments"
            element={
              <AdminRoute>
                <AdminComments />
              </AdminRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;