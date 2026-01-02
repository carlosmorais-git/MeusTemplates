import { useState } from "react";
import { Play, Download, Clock, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TemplateCard = ({
  template,
  onStartProject,
  onExportMarkdown,
  showActions = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartProject = async () => {
    setIsLoading(true);
    try {
      await onStartProject(template);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await onExportMarkdown(template);
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm bg-gray-100">
            <span className="text-xs font-medium">{template.technology}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {template.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{template.technology}</span>
              <span>•</span>
              <span>v{template.version}</span>
            </div>
          </div>
        </div>

        {/* Favoritos removidos do backend; botão ocultado */}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {template.description}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>{template.steps_count} etapas</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{template.created_by_username || "Desconhecido"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(template.created_at)}</span>
          </div>
        </div>

        {template.is_public && (
          <Badge variant="secondary" className="text-xs">
            Público
          </Badge>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleStartProject}
            disabled={isLoading}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? "Iniciando..." : "Iniciar Projeto"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TemplateCard;
