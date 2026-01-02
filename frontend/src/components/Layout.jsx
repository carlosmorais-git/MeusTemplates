import { useState } from "react";
import React from "react";
import {
  Brain,
  BookOpen,
  FolderOpen,
  Star,
  BarChart3,
  Settings,
  Menu,
  X,
  Home,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import apiService from "@/services/api";
import { useIsMobile } from "@/hooks/use-mobile";
const MobileTabs = ({ menuItems, currentPage, onPageChange }) => {
  return (
    <div className="lg:hidden">
      <nav className="flex justify-around p-2 border-t bg-white">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              className={`flex items-center space-x-2 p-2 rounded-md ${
                isActive ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              onClick={() => onPageChange(item.id)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span
                  style={{
                    fontSize: "16px",
                    color: isActive ? "blue" : "gray",
                  }}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
const Layout = ({ children, currentPage, onPageChange }) => {
  // hooks
  const modeMobile = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "templates", label: "Templates", icon: BookOpen },
    {
      id: "projects",
      label: "Projetos",
      icon: FolderOpen,
    },
    // { id: "favorites", label: "Favoritos", icon: Star },
  ];

  const handleMenuClick = (pageId) => {
    onPageChange(pageId);
    setSidebarOpen(false);
  };
  const handleTabClick = (pageId) => {
    onPageChange(pageId);
  };
  //  logout apiService.logout()
  const logoutUser = async () => {
    await apiService.logout();
    window.location.reload();
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b fixar_header">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {!modeMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}

            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Painel de Aprendizado
                </h1>
                <p className="text-sm text-gray-500">Consolidação de Ideias</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* logout */}
            <Button variant="ghost" size="sm" onClick={logoutUser}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar para desktop */}
        <div className="menu_desktop fixed_menu_top ">
          {!modeMobile && (
            <aside
              className={`
              fixed  left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
              lg:translate-x-0 lg:static lg:inset-0 fixed_menu_top 

              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            `}
            >
              <div className="flex flex-col h-full lg:pt-0">
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={`
                        w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                        ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isActive ? "text-blue-600" : "text-gray-500"
                          }`}
                        />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="p-4 border-t">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                    <h3 className="font-semibold text-sm">💡 Dica do Dia</h3>
                    <p className="text-xs mt-1 opacity-90">
                      Use templates para acelerar seu aprendizado e manter
                      consistência nos projetos!
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
        {/* Main Content */}
        <main className="flex-1 lg:ml-0 pb-16">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Tabs fixas no rodapé para mobile */}
      {modeMobile && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t z-50">
          <MobileTabs
            menuItems={menuItems}
            currentPage={currentPage}
            onPageChange={handleTabClick}
          />
        </div>
      )}
    </div>
  );
};

export default Layout;
