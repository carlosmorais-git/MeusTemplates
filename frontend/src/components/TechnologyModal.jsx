import { useState } from "react";
import { X, Save, Palette, Link, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const TechnologyModal = ({ isOpen, onClose, onTechnologyCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "🔧",
    color: "#3B82F6",
    documentation_url: "",
  });

  const [loading, setLoading] = useState(false);

  const commonIcons = [
    "🔧",
    "⚛️",
    "🐍",
    "☕",
    "🟢",
    "🦋",
    "🔗",
    "📱",
    "💻",
    "🌐",
    "⚡",
    "🚀",
    "🔥",
    "💎",
    "🎯",
    "🛠️",
  ];

  const commonColors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#F97316", // Orange
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#EC4899", // Pink
    "#6B7280", // Gray
    "#1F2937", // Dark Gray
    "#7C3AED", // Violet
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações básicas
      if (!formData.name.trim()) {
        alert("Nome da tecnologia é obrigatório");
        return;
      }

      if (!formData.description.trim()) {
        alert("Descrição é obrigatória");
        return;
      }

      // Simular criação da tecnologia (já que não temos endpoint real)
      const newTechnology = {
        id: Date.now(), // ID temporário
        ...formData,
        templates_count: 0,
        created_at: new Date().toISOString(),
      };

      console.log("Tecnologia criada:", newTechnology);

      // Notificar sucesso
      alert("Tecnologia criada com sucesso!");

      // Resetar formulário
      resetForm();

      // Chamar callback
      if (onTechnologyCreated) {
        onTechnologyCreated(newTechnology);
      }

      // Fechar modal
      onClose();
    } catch (error) {
      console.error("Erro ao criar tecnologia:", error);
      alert("Erro ao criar tecnologia. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "🔧",
      color: "#3B82F6",
      documentation_url: "",
    });
  };

  // Travar a rolada do fundo quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 background_blur bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Adicionar Nova Tecnologia
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Preview Card */}
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Preview
              </h3>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: formData.color + "20",
                      color: formData.color,
                    }}
                  >
                    {formData.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {formData.name || "Nome da Tecnologia"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formData.description || "Descrição da tecnologia"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Informações Básicas
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Tecnologia *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: React, Python, Node.js"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva o que é esta tecnologia e para que serve..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Documentação
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="url"
                    value={formData.documentation_url}
                    onChange={(e) =>
                      handleInputChange("documentation_url", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://docs.exemplo.com"
                  />
                </div>
              </div>
            </div>

            {/* Aparência */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Aparência
              </h3>

              {/* Ícone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone
                </label>
                <div className="grid grid-cols-8 gap-2 mb-3">
                  {commonIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleInputChange("icon", icon)}
                      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors ${
                        formData.icon === icon
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => handleInputChange("icon", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ou digite um emoji personalizado"
                  maxLength={2}
                />
              </div>

              {/* Cor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Principal
                </label>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {commonColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange("color", color)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? "border-gray-800 scale-110"
                          : "border-gray-300 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="#3B82F6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end padding-4 space-x-3 border-t border-gray-200 ">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Criar Tecnologia
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TechnologyModal;
