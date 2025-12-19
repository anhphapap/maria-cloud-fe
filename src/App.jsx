import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { MyUserContext } from "./contexts/UserContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import MainLayout from "./layouts/MainLayout";
import { UserProvider } from "./contexts/UserContext";
import { ToastProvider } from "./contexts/ToastContext";

function ProtectedRoutes() {
  const user = useContext(MyUserContext);

  return (
    <Routes>
      {/* Public Routes - Không có layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes - Có MainLayout */}
      <Route
        element={
          user !== null ? <MainLayout user={user} /> : <Navigate to="/login" />
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ToastProvider>
          <ProtectedRoutes />
        </ToastProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
