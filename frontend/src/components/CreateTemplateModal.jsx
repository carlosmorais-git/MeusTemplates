import { useState, useEffect } from "react";
import { X, Plus, Trash2, Code, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiService from "../services/api";

const CreateTemplateModal = ({ isOpen, onClose, onTemplateCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    technology: "",
    is_public: true,
    tags: [],
  });

  const [steps, setSteps] = useState([
    {
      order: 1,
      question: "",
      description: "",
      is_required: true,
      code_snippets: [],
    },
  ]);

  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTechnologies();
    }
  }, [isOpen]);

  const loadTechnologies = async () => {
    try {
      const data = await apiService.getTechnologies();
      setTechnologies(data.results || data);
    } catch (error) {
      console.error("Erro ao carregar tecnologias:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStepChange = (stepIndex, field, value) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, [field]: value } : step
      )
    );
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        order: prev.length + 1,
        question: "",
        description: "",
        is_required: true,
        code_snippets: [],
      },
    ]);
  };

  const removeStep = (stepIndex) => {
    if (steps.length > 1) {
      setSteps((prev) =>
        prev
          .filter((_, index) => index !== stepIndex)
          .map((step, index) => ({ ...step, order: index + 1 }))
      );
    }
  };

  const addCodeSnippet = (stepIndex) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex
          ? {
              ...step,
              code_snippets: [
                ...step.code_snippets,
                {
                  language: "javascript",
                  code: "",
                  description: "",
                  is_example: true,
                },
              ],
            }
          : step
      )
    );
  };

  const updateCodeSnippet = (stepIndex, snippetIndex, field, value) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex
          ? {
              ...step,
              code_snippets: step.code_snippets.map((snippet, sIndex) =>
                sIndex === snippetIndex
                  ? { ...snippet, [field]: value }
                  : snippet
              ),
            }
          : step
      )
    );
  };

  const removeCodeSnippet = (stepIndex, snippetIndex) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex
          ? {
              ...step,
              code_snippets: step.code_snippets.filter(
                (_, sIndex) => sIndex !== snippetIndex
              ),
            }
          : step
      )
    );
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações básicas
      if (!formData.name.trim()) {
        alert("Nome do template é obrigatório");
        return;
      }

      if (!formData.technology) {
        alert("Tecnologia é obrigatória");
        return;
      }

      if (steps.some((step) => !step.question.trim())) {
        alert("Todas as etapas devem ter uma pergunta");
        return;
      }

      // Preparar dados para envio
      const templateData = {
        ...formData,
        technology_id: formData.technology, // campo esperado pelo backend
        steps: steps.map((step) => ({
          ...step,
          code_snippets: step.code_snippets.filter((snippet) =>
            snippet.code.trim()
          ),
        })),
      };

      // Enviar para o backend
      const novoTemplate = await apiService.request("templates/", {
        method: "POST",
        body: JSON.stringify(templateData),
      });

      // Notificar sucesso
      alert("Template criado com sucesso!");

      // Resetar formulário
      resetForm();

      // Chamar callback com o objeto retornado do backend
      if (onTemplateCreated) {
        onTemplateCreated(novoTemplate);
      }

      // Fechar modal
      onClose();
    } catch (error) {
      console.error("Erro ao criar template:", error);
      alert("Erro ao criar template. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      technology: "",
      is_public: true,
      tags: [],
    });
    setSteps([
      {
        order: 1,
        question: "",
        description: "",
        is_required: true,
        code_snippets: [],
      },
    ]);
    setCurrentTag("");
    setPreviewMode(false);
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
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 background_blur">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {previewMode ? "Preview do Template" : "Criar Novo Template"}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? "Continuar editando" : "Preview"}
            </Button>
          </div>
          {!previewMode && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
          {previewMode ? (
            // Preview Mode
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {formData.name || "Nome do Template"}
                </h3>
                <p className="text-gray-600 mb-3">
                  {formData.description || "Descrição do template"}
                </p>
                <div className="flex items-center space-x-2">
                  {technologies.find(
                    (t) => t.id.toString() === formData.technology
                  ) && (
                    <Badge variant="secondary">
                      {
                        technologies.find(
                          (t) => t.id.toString() === formData.technology
                        ).icon
                      }{" "}
                      {
                        technologies.find(
                          (t) => t.id.toString() === formData.technology
                        ).name
                      }
                    </Badge>
                  )}
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900">
                  Etapas do Checklist
                </h4>
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {step.order}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">
                          {step.question || `Pergunta ${step.order}`}
                        </h5>
                        {step.description && (
                          <p className="text-gray-600 text-sm mb-2">
                            {step.description}
                          </p>
                        )}
                        {step.code_snippets.map((snippet, sIndex) => (
                          <div key={sIndex} className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">
                              {snippet.description ||
                                `Exemplo em ${snippet.language}`}
                            </div>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                              <code>{snippet.code || "// Código aqui..."}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Informações Básicas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Template *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Setup Inicial React"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tecnologia *
                    </label>
                    <select
                      value={formData.technology}
                      onChange={(e) =>
                        handleInputChange("technology", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione uma tecnologia</option>
                      {technologies.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.icon} {tech.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva o que este template ajuda a fazer..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag())
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Adicionar tag..."
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) =>
                      handleInputChange("is_public", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_public" className="text-sm text-gray-700">
                    Template público (visível para todos os usuários)
                  </label>
                </div>
              </div>

              {/* Etapas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Etapas do Checklist
                  </h3>
                  <Button type="button" variant="outline" onClick={addStep}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Etapa
                  </Button>
                </div>

                {steps.map((step, stepIndex) => (
                  <div
                    key={stepIndex}
                    className="border border-gray-200 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Etapa {step.order}
                      </h4>
                      {steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(stepIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pergunta/Tarefa *
                        </label>
                        <input
                          type="text"
                          value={step.question}
                          onChange={(e) =>
                            handleStepChange(
                              stepIndex,
                              "question",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Configurar ambiente de desenvolvimento"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição/Instruções
                        </label>
                        <textarea
                          value={step.description}
                          onChange={(e) =>
                            handleStepChange(
                              stepIndex,
                              "description",
                              e.target.value
                            )
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Instruções detalhadas para esta etapa..."
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`required_${stepIndex}`}
                          checked={step.is_required}
                          onChange={(e) =>
                            handleStepChange(
                              stepIndex,
                              "is_required",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`required_${stepIndex}`}
                          className="text-sm text-gray-700"
                        >
                          Etapa obrigatória
                        </label>
                      </div>
                    </div>

                    {/* Code Snippets */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Exemplos de Código
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addCodeSnippet(stepIndex)}
                        >
                          <Code className="h-4 w-4 mr-2" />
                          Adicionar Código
                        </Button>
                      </div>

                      {step.code_snippets.map((snippet, snippetIndex) => (
                        <div
                          key={snippetIndex}
                          className="bg-gray-50 rounded-lg p-3 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <select
                                value={snippet.language}
                                onChange={(e) =>
                                  updateCodeSnippet(
                                    stepIndex,
                                    snippetIndex,
                                    "language",
                                    e.target.value
                                  )
                                }
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="bash">Bash</option>
                                <option value="json">JSON</option>
                                <option value="yaml">YAML</option>
                              </select>
                              <input
                                type="text"
                                value={snippet.description}
                                onChange={(e) =>
                                  updateCodeSnippet(
                                    stepIndex,
                                    snippetIndex,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Descrição do código..."
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeCodeSnippet(stepIndex, snippetIndex)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <textarea
                            value={snippet.code}
                            onChange={(e) =>
                              updateCodeSnippet(
                                stepIndex,
                                snippetIndex,
                                "code",
                                e.target.value
                              )
                            }
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm"
                            placeholder="Cole seu código aqui..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!previewMode && (
          <div className="flex items-center justify-end space-x-3 padding-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Criar Template
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTemplateModal;
