import { useState, useEffect } from "react";
import { Search, Filter, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TemplateCard from "../components/TemplateCard";
import CreateTemplateModal from "../components/CreateTemplateModal";
import apiService from "../services/api";

const Templates = ({ onNavigate, params = {} }) => {
  const [templates, setTemplates] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechnology, setSelectedTechnology] = useState(
    params.technology || ""
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesData, technologiesData] = await Promise.all([
        apiService.getTemplates({ technology: selectedTechnology }),
        apiService.getTechnologies(),
      ]);

      setTemplates(templatesData.results || templatesData);
      setTechnologies(technologiesData.results || technologiesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProject = async (template) => {
    try {
      const projectName = `Projeto ${template.name}`;
      const project = await apiService.startProject(template.id, {
        name: projectName,
        description: `Projeto baseado no template: ${template.name}`,
      });

      // Navegar para a página de projetos ou para o projeto específico
      onNavigate("projects", { projectId: project.id });
    } catch (error) {
      console.error("Erro ao iniciar projeto:", error);
      alert("Erro ao iniciar projeto. Tente novamente.");
    }
  };

  const handleToggleFavorite = async (template) => {
    try {
      await apiService.favoriteTemplate(template.id);
      // Recarregar templates para atualizar o status de favorito
      loadData();
    } catch (error) {
      console.error("Erro ao favoritar template:", error);
    }
  };

  const handleExportMarkdown = async (template) => {
    try {
      const blob = await apiService.exportTemplateMarkdown(template.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${template.name}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao exportar template:", error);
      alert("Erro ao exportar template. Tente novamente.");
    }
  };

  const handleTechnologyFilter = async (technologyId) => {
    setSelectedTechnology(technologyId);
    setLoading(true);

    try {
      const templatesData = await apiService.getTemplates({
        technology: technologyId || undefined,
      });
      setTemplates(templatesData.results || templatesData);
    } catch (error) {
      console.error("Erro ao filtrar templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateCreated = (newTemplate) => {
    // Adicionar o novo template à lista
    setTemplates((prev) => [newTemplate, ...prev]);
    // Recarregar dados para garantir consistência
    loadData();
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.technology.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600">
            Escolha um template para iniciar seu projeto
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedTechnology}
            onChange={(e) => handleTechnologyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as tecnologias</option>
            {technologies.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.icon} {tech.name}
              </option>
            ))}
          </select>

          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Mais Filtros</span>
          </Button>
        </div>
      </div>

      {/* Technology Filter Pills */}
      {technologies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedTechnology === "" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => handleTechnologyFilter("")}
          >
            Todos
          </Badge>
          {technologies.map((tech) => (
            <Badge
              key={tech.id}
              variant={
                selectedTechnology === tech.id.toString()
                  ? "default"
                  : "secondary"
              }
              className="cursor-pointer"
              onClick={() => handleTechnologyFilter(tech.id.toString())}
            >
              {tech.icon} {tech.name} ({tech.templates_count})
            </Badge>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onStartProject={handleStartProject}
              onToggleFavorite={handleToggleFavorite}
              onExportMarkdown={handleExportMarkdown}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedTechnology
              ? "Nenhum template encontrado"
              : "Nenhum template disponível"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedTechnology
              ? "Tente ajustar os filtros ou buscar por outros termos"
              : "Ainda não há templates cadastrados no sistema"}
          </p>
          {(searchTerm || selectedTechnology) && (
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Limpar Busca
              </Button>
              <Button
                variant="outline"
                onClick={() => handleTechnologyFilter("")}
              >
                Remover Filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Estatísticas dos Templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {templates.length}
            </div>
            <div className="text-sm text-gray-500">Templates Totais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {technologies.length}
            </div>
            <div className="text-sm text-gray-500">Tecnologias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {templates.filter((t) => t.is_favorited).length}
            </div>
            <div className="text-sm text-gray-500">Favoritos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(
                templates.reduce((sum, t) => sum + t.steps_count, 0) /
                  templates.length
              ) || 0}
            </div>
            <div className="text-sm text-gray-500">Etapas Médias</div>
          </div>
        </div>
      </div>

      {/* Popular Templates */}
      {templates.length > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-3">⭐ Templates Populares</h2>
          <p className="text-green-100 mb-4">
            Estes são os templates mais utilizados para acelerar o
            desenvolvimento.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates
              .sort((a, b) => b.steps_count - a.steps_count)
              .slice(0, 3)
              .map((template) => (
                <div
                  key={template.id}
                  className="bg-white bg-opacity-20 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{template.technology.icon}</span>
                    <span className="font-medium">{template.name}</span>
                  </div>
                  <p className="text-sm text-green-100 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="mt-2 text-xs text-green-200">
                    {template.steps_count} etapas • {template.technology.name}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTemplateCreated={handleTemplateCreated}
      />
    </div>
  );
};

export default Templates;
