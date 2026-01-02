import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import Projects from "./pages/Projects";
import "./index.css";
import "./App.css";

function App() {
  const isAuthenticated = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [pageParams, setPageParams] = useState({});

  const handlePageChange = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  if (isAuthenticated === false) {
    return <Login />;
  }
  if (isAuthenticated === null) {
    return <div>Carregando...</div>;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={handlePageChange} />;
      case "templates":
        return <Templates onNavigate={handlePageChange} params={pageParams} />;
      case "projects":
        return <Projects onNavigate={handlePageChange} params={pageParams} />;
      // Favorites and Progress pages removed
      default:
        return <Dashboard onNavigate={handlePageChange} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={handlePageChange}>
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;
