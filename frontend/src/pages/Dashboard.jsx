import { useState, useEffect } from "react";
import {
  TrendingUp,
  BookOpen,
  FolderOpen,
  Star,
  Clock,
  Award,
  Target,
  Zap,
} from "lucide-react";
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
      const data = await apiService.getUserDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      // Dados mock para demonstração
      setDashboardData({
        stats: {
          total_projects: 0,
          completed_projects: 0,
          technologies_used: 0,
          completion_rate: 0,
        },
        progress_by_technology: [],
        recent_projects: [],
        favorite_templates: [],
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

  const { stats, progress_by_technology, recent_projects, favorite_templates } =
    dashboardData;

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
    {
      title: "Templates Favoritos",
      value: favorite_templates.length,
      icon: Star,
      color: "bg-yellow-500",
      change: "Seus preferidos",
    },
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
        {/* Progresso por Tecnologia */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Progresso por Tecnologia
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("progress")}
            >
              Ver Detalhes
            </Button>
          </div>

          {progress_by_technology.length > 0 ? (
            <div className="space-y-4">
              {progress_by_technology.map((progress) => (
                <div
                  key={progress.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{
                        backgroundColor: `${progress.technology.color}20`,
                      }}
                    >
                      {progress.technology.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {progress.technology.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Nível {progress.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {progress.projects_completed} projetos
                    </p>
                    <p className="text-xs text-gray-500">
                      {progress.total_hours}h estudadas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Comece seu primeiro projeto para ver o progresso!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => onNavigate("technologies")}
              >
                Explorar Tecnologias
              </Button>
            </div>
          )}
        </div>

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
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{
                        backgroundColor: `${project.template.technology.color}20`,
                      }}
                    >
                      {project.template.technology.icon}
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
                    <p className="text-xs text-gray-500 mt-1">
                      {project.progress_percentage}%
                    </p>
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

      {/* Templates Favoritos */}
      {favorite_templates.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Templates Favoritos
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("favorites")}
            >
              Ver Todos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorite_templates.slice(0, 3).map((template) => (
              <div key={template.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{
                      backgroundColor: `${template.technology.color}20`,
                    }}
                  >
                    {template.technology.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {template.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {template.technology.name}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {template.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dicas e Motivação */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <Award className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Continue Aprendendo!</h2>
        </div>
        <p className="text-blue-100 mb-4">
          Cada projeto completado é um passo a mais na sua jornada de
          aprendizado. Use os templates para manter a consistência e acelerar
          seu desenvolvimento.
        </p>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate("technologies")}
          >
            Explorar Tecnologias
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-blue-600"
            onClick={() => onNavigate("templates")}
          >
            Ver Templates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
