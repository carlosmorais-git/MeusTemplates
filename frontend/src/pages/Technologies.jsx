import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  ExternalLink,
  BookOpen,
  Code,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TechnologyModal from "../components/TechnologyModal";
import apiService from "../services/api";
import TechnologyCard from "@/components/TechnologyCard";

const Technologies = ({ onNavigate }) => {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTechnologies();
  }, []);

  const loadTechnologies = async () => {
    try {
      const response = await apiService.getTechnologies();

      setTechnologies(response.results?.data || response.results || []);
    } catch (error) {
      console.error("Erro ao carregar tecnologias:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleViewTemplates = (technology) => {
    onNavigate("templates", { technology: technology.id });
  };
  //  Cria tecnologia via api
  const handleTechnologyCreated = async (newTechnology) => {
    try {
      await apiService.createTechnologies(newTechnology);
      // Adicionar a nova tecnologia à lista
      setTechnologies((prev) => [newTechnology, ...prev]);
      // Recarregar dados para garantir consistência
      loadTechnologies();
    } catch (error) {
      console.error("Erro ao criar tecnologia:", error);
    }
  };

  // const handleTechnologyCreated = (newTechnology) => {
  //   // Adicionar a nova tecnologia à lista
  //   setTechnologies((prev) => [newTechnology, ...prev]);
  //   // Recarregar dados para garantir consistência
  //   loadTechnologies();
  // };
  const handleViewRoadmap = (technology) => {
    // Navegar para roadmap da tecnologia
    onNavigate("roadmap", { technology: technology.id });
  };

  const filteredTechnologies = technologies.filter(
    (tech) =>
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.description.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Tecnologias</h1>
          <p className="text-gray-600">
            Explore diferentes tecnologias e seus templates de aprendizado
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Tecnologia
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar tecnologias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          {/* <Filter className="h-4 w-4" /> */}
          <span>Filtros</span>
        </Button>
      </div>

      {/* Technologies Grid mini 20rem */}
      {filteredTechnologies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechnologies.map((technology) => (
            <TechnologyCard
              key={technology.id}
              technology={technology}
              onViewTemplates={handleViewTemplates}
              onViewRoadmap={handleViewRoadmap}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm
              ? "Nenhuma tecnologia encontrada"
              : "Nenhuma tecnologia disponível"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? `Não encontramos tecnologias que correspondam a "${searchTerm}"`
              : "Ainda não há tecnologias cadastradas no sistema"}
          </p>
          {searchTerm && (
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Limpar Busca
            </Button>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Estatísticas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {technologies.length}
            </div>
            <div className="text-sm text-gray-500">Tecnologias Disponíveis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {technologies.reduce(
                (sum, tech) => sum + tech.templates_count,
                0
              )}
            </div>
            <div className="text-sm text-gray-500">Templates Totais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                technologies.reduce(
                  (sum, tech) => sum + tech.templates_count,
                  0
                ) / technologies.length
              ) || 0}
            </div>
            <div className="text-sm text-gray-500">Média por Tecnologia</div>
          </div>
        </div>
      </div>

      {/* Popular Technologies */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-black">
        <h2 className="text-lg font-semibold mb-3">🔥 Tecnologias Populares</h2>
        <p className="text-indigo-100 mb-4">
          Estas são as tecnologias mais utilizadas pelos desenvolvedores
          atualmente.
        </p>
        <div className="flex flex-wrap gap-2">
          {technologies
            .sort((a, b) => b.templates_count - a.templates_count)
            .slice(0, 5)
            .map((tech) => (
              <span
                key={tech.id}
                className="inline-flex items-center space-x-1 bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm"
              >
                <span>{tech.icon}</span>
                <span>{tech.name}</span>
              </span>
            ))}
        </div>
      </div>
      {/* Technology Modal */}
      <TechnologyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTechnologyCreated={handleTechnologyCreated}
      />
    </div>
  );
};

export default Technologies;
