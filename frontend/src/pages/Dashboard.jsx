import { useState, useEffect } from "react";
import { BookOpen, FolderOpen, Award, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiService from "../services/api";

const Dashboard = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Backend removed the dashboard/progress endpoints. Build a minimal
      // dashboard from projects endpoint instead.
      const projectsData = await apiService.getProjects({});
      const projectsList = projectsData.results || projectsData || [];

      const totalProjects = projectsData.count || projectsList.length;
      const uniqueTechs = [
        ...new Set(
          projectsList.map((p) => String(p.template?.technology || ""))
        ),
      ].filter((t) => t);

      setDashboardData({
        stats: {
          total_projects: totalProjects,
          completed_projects: projectsList.filter(
            (p) => p.status === "completed"
          ).length,
          technologies_used: uniqueTechs.length,
          completion_rate: 0,
        },
        recent_projects: projectsList.slice(0, 5),
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setDashboardData({
        stats: {
          total_projects: 0,
          completed_projects: 0,
          technologies_used: 0,
          completion_rate: 0,
        },
        recent_projects: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { stats, recent_projects } = dashboardData;

  const statCards = [
    {
      title: "Projetos Totais",
      value: stats.total_projects,
      icon: FolderOpen,
      color: "bg-blue-500",
      change: "+2 esta semana",
    },
    {
      title: "Projetos Concluídos",
      value: stats.completed_projects,
      icon: Target,
      color: "bg-green-500",
      change: `${stats.completion_rate.toFixed(1)}% taxa de conclusão`,
    },
    {
      title: "Tecnologias",
      value: stats.technologies_used,
      icon: BookOpen,
      color: "bg-purple-500",
      change: "Diversificando conhecimento",
    },
    // Favorites removed
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex items-center justify-between content_title_screen_mobile`}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Acompanhe seu progresso de aprendizado
          </p>
        </div>
        <Button onClick={() => onNavigate("templates")}>
          <Zap className="h-4 w-4 mr-2" />
          Explorar Templates
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progresso removido */}

        {/* Projetos Recentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Projetos Recentes
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("projects")}
            >
              Ver Todos
            </Button>
          </div>

          {recent_projects.length > 0 ? (
            <div className="space-y-3">
              {recent_projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-gray-100">
                      <span className="text-xs font-medium">
                        {project.template.technology}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {project.template.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        project.status === "completed" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {project.status === "completed"
                        ? "Concluído"
                        : project.status === "in_progress"
                        ? "Em Progresso"
                        : "Rascunho"}
                    </Badge>
                    {/* progress percentage removed */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum projeto criado ainda</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => onNavigate("templates")}
              >
                Criar Primeiro Projeto
              </Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
