import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useContext, useEffect } from "react";
import { MyUserContext } from "./contexts/UserContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import DatabasesPage from "./pages/DatabasesPage";
import DatabaseDetailPage from "./pages/DatabaseDetailPage";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";
import MainLayout from "./layouts/MainLayout";
import { UserProvider } from "./contexts/UserContext";
import { ToastProvider } from "./contexts/ToastContext";

function ProtectedWrapper({ children, user }) {
  const location = useLocation();

  useEffect(() => {
    if (
      user === null &&
      location.pathname !== "/login" &&
      location.pathname !== "/register"
    ) {
      // Lưu URL hiện tại (bao gồm cả query params) để redirect sau khi login
      const intendedUrl = location.pathname + location.search;
      localStorage.setItem("intendedUrl", intendedUrl);
    }
  }, [user, location]);

  if (user !== null) {
    return children;
  }

  return <Navigate to="/login" />;
}

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
          <ProtectedWrapper user={user}>
            <MainLayout user={user} />
          </ProtectedWrapper>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/databases" element={<DatabasesPage />} />
        <Route path="/databases/:id" element={<DatabaseDetailPage />} />
        <Route path="/invite" element={<AcceptInvitationPage />} />
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
