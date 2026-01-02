import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Play,
  CheckCircle,
  Circle,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiService from "../services/api";

const Projects = ({ onNavigate, params = {} }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectSteps, setProjectSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await apiService.getProjects(params);
      setProjects(response.results?.data || response.results || []);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectSteps = async (projectId) => {
    try {
      const response = await apiService.getProject(projectId);
      console.log("Etapas do projeto:", response);
      setProjectSteps(response.results?.data || response.results || []);
    } catch (error) {
      console.error("Erro ao carregar etapas:", error);
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    loadProjectSteps(project.id);
  };

  const handleToggleStep = async (stepId) => {
    try {
      setProjectSteps((prev) =>
        prev.map((step) =>
          step.id === stepId
            ? { ...step, is_completed: !step.is_completed }
            : step
        )
      );

      // Atualizar progresso do projeto
      const completedSteps = projectSteps.filter(
        (s) => s.is_completed || s.id === stepId
      ).length;
      const progress = Math.round((completedSteps / projectSteps.length) * 100);

      setProjects((prev) =>
        prev.map((project) =>
          project.id === selectedProject.id ? { ...project, progress } : project
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar etapa:", error);
    }
  };

  const handleUpdateNotes = async (stepId, notes) => {
    try {
      setProjectSteps((prev) =>
        prev.map((step) => (step.id === stepId ? { ...step, notes } : step))
      );
    } catch (error) {
      console.error("Erro ao atualizar notas:", error);
    }
  };

  const handleExportGuide = async (project) => {
    try {
      // Gerar guia em Markdown
      const guide = generateMarkdownGuide(project, projectSteps);
      const blob = new Blob([guide], { type: "text/markdown" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `guia_${project.name.replace(/\s+/g, "_").toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao exportar guia:", error);
    }
  };

  const generateMarkdownGuide = (project, steps) => {
    const completedSteps = steps.filter((s) => s.is_completed);
    const pendingSteps = steps.filter((s) => !s.is_completed);

    return `# Guia do Projeto: ${project.name}

## Informações do Projeto
- **Nome:** ${project.name}
- **Descrição:** ${project.description}
    - **Template:** ${project.template.name}
    - **Tecnologia:** ${project.template.technology}
- **Status:** ${project.status}
- **Progresso:** ${project.progress}%
- **Criado em:** ${new Date(project.created_at).toLocaleDateString("pt-BR")}
- **Última atualização:** ${new Date(project.updated_at).toLocaleDateString(
      "pt-BR"
    )}

## ✅ Etapas Concluídas (${completedSteps.length}/${steps.length})

${completedSteps
  .map(
    (step) => `
### ${step.order}. ${step.title}
${step.description}

${step.notes ? `**Notas:** ${step.notes}` : ""}
`
  )
  .join("\n")}

## 📋 Próximas Etapas (${pendingSteps.length} restantes)

${pendingSteps
  .map(
    (step) => `
### ${step.order}. ${step.title}
${step.description}

- [ ] ${step.title}
${step.notes ? `\n**Notas:** ${step.notes}` : ""}
`
  )
  .join("\n")}

## 📊 Resumo do Progresso
- **Etapas concluídas:** ${completedSteps.length}
- **Etapas pendentes:** ${pendingSteps.length}
- **Progresso total:** ${project.progress}%

---
*Guia gerado automaticamente pelo Painel de Aprendizado em ${new Date().toLocaleDateString(
      "pt-BR"
    )}*
`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "in_progress":
        return "Em Progresso";
      case "draft":
        return "Rascunho";
      default:
        return "Desconhecido";
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(project.template.technology || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );
  console.log("Projetos filtrados:", filteredProjects);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between content_title_screen_mobile">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Projetos</h1>
          <p className="text-gray-600">Gerencie seus projetos</p>
        </div>
        <Button onClick={() => onNavigate("templates")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Projetos */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Projects List */}
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleSelectProject(project)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedProject?.id === project.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {project.name}
                  </h3>
                  <span className="text-lg">{project.template.technology}</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {project.description}
                </p>

                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusText(project.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📁</div>
              <p className="text-gray-500">Nenhum projeto encontrado</p>
            </div>
          )}
        </div>

        {/* Detalhes do Projeto */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedProject.name}
                  </h2>
                  <p className="text-gray-600 mb-3">
                    {selectedProject.description}
                  </p>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {getStatusText(selectedProject.status)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {selectedProject.template.technology}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportGuide(selectedProject)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Exportar Guia
                  </Button>
                </div>
              </div>

              {/* Progress UI removed */}

              {/* Steps Checklist */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Checklist do Projeto
                </h3>

                {projectSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 border rounded-lg ${
                      step.is_completed
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleToggleStep(step.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {step.is_completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>

                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            step.is_completed
                              ? "text-green-900 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {step.order}. {step.title}
                        </h4>
                        <p
                          className={`text-sm mt-1 ${
                            step.is_completed
                              ? "text-green-700"
                              : "text-gray-600"
                          }`}
                        >
                          {step.description}
                        </p>

                        {/* Notes */}
                        <div className="mt-2">
                          <textarea
                            placeholder="Adicionar notas..."
                            value={step.notes}
                            onChange={(e) =>
                              handleUpdateNotes(step.id, e.target.value)
                            }
                            className="w-full text-sm p-2 border border-gray-200 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione um projeto
              </h3>
              <p className="text-gray-500">
                Escolha um projeto da lista para ver os detalhes e gerenciar o
                checklist
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
