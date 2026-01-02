import { useState, useEffect } from "react";
import { Search, Filter, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TemplateCard from "../components/TemplateCard";
import CreateTemplateModal from "../components/CreateTemplateModal";
import apiService from "../services/api";

const Templates = ({ onNavigate, params = {} }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechnology, setSelectedTechnology] = useState(
    params.technology || ""
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Garantir que `templates` seja sempre um array ao consumir
  const templatesArr = Array.isArray(templates) ? templates : [];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const templatesData = await apiService.getTemplates();
      const list = Array.isArray(templatesData?.results)
        ? templatesData.results
        : Array.isArray(templatesData)
        ? templatesData
        : [];
      setTemplates(list);
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

  // Favorites removed from backend; no longer used.

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
      // Filtrar client-side já que não temos endpoint de technologies
      const allTemplates = await apiService.getTemplates();
      const all = Array.isArray(allTemplates?.results)
        ? allTemplates.results
        : Array.isArray(allTemplates)
        ? allTemplates
        : [];
      const list = all.filter((t) =>
        technologyId ? String(t.technology) === String(technologyId) : true
      );
      setTemplates(list);
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

  const filteredTemplates = templatesArr.filter((template) => {
    const name = (template.name || "").toLowerCase();
    const description = (template.description || "").toLowerCase();
    const term = (searchTerm || "").toLowerCase();
    const techMatch = selectedTechnology
      ? String(template.technology || "").toLowerCase() ===
        String(selectedTechnology).toLowerCase()
      : true;
    return (name.includes(term) || description.includes(term)) && techMatch;
  });

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
          <input
            type="text"
            placeholder="Filtrar por tecnologia (ex: React)"
            value={selectedTechnology}
            onChange={(e) => handleTechnologyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Mais Filtros</span>
          </Button>
        </div>
      </div>

      {/* Technology Filter Pills */}
      {/* technology pills removed (backend no longer exposes technologies) */}

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onStartProject={handleStartProject}
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
