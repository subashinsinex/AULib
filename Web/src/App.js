import "./App.css";
import AdminPanel from "./layouts/AdminPanel";
import Login from "./layouts/Login";
import ActiveTimer from "./components/ActiveTimer";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <>
      {!isLoginPage && <ActiveTimer />}{" "}
      {/* ActiveTimer will not run on Login */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/adminpanel" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
