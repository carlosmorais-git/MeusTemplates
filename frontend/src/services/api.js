const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000/api/"
    : "https://meu-backend-em-producao.com/";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Ler cookie por nome (para obter csrftoken)
  getCookie(name) {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  // Método auxiliar para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", //para enviar cookies de sessão (se o backend usa sessão)
      ...options,
    };

    if (!(config.body instanceof FormData)) {
      config.headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
    }

    try {
      // Se for requisição que modifica estado, injeta header X-CSRFToken quando disponível
      const method = (config.method || "GET").toUpperCase();
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        const csrf = this.getCookie("csrftoken");
        if (csrf) {
          config.headers = {
            ...config.headers,
            "X-CSRFToken": csrf,
          };
        }
      }
      const response = await fetch(url, config);
      if (response.status === 401) {
        // Não redirecionar automaticamente aqui; retornar o status
        // para que o hook/useAuth ou componentes acima decidam o que fazer
        return { status: 401 };
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Autenticarção
  async login(username, password) {
    // Em setups com SessionAuthentication e CsrfViewMiddleware, precisamos
    // garantir que o cookie CSRF exista. Fazer uma GET simples para obter
    // o cookie antes do POST pode ajudar (Django costuma setar csrftoken).
    try {
      await fetch(this.baseURL, { method: "GET", credentials: "include" });
    } catch {
      // ignora
    }

    const csrfToken = this.getCookie("csrftoken");
    // debug: imprimir cookies antes do POST (verificar csrftoken/sessionid)
    try {
      console.log("document.cookie before login POST ->", document.cookie);
    } catch {
      // ambiente sem document
    }
    const response = await fetch(`${this.baseURL}api-auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      },
      credentials: "include",
      body: `username=${encodeURIComponent(
        username
      )}&password=${encodeURIComponent(password)}`,
    });
    console.log("Logado automatico");
    if (!response.ok) {
      throw new Error("Login failed");
    }
    return response;
  }

  async logout() {
    const response = await fetch(`${this.baseURL}api-auth/logout/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Logout failed");
    }
    // Redirecionamento deixado no componente que chamou logout
    return response;
  }

  async getCurrentUser() {
    return this.request("users/");
  }

  // Tecnologias
  async getTechnologies() {
    return this.request("technologies/");
  }

  async createTechnologies(tech) {
    return this.request("technologies/", {
      method: "POST",
      body: JSON.stringify(tech),
    });
  }

  async getTechnology(id) {
    return this.request(`technologies/${id}/`);
  }

  async getTechnologyTemplates(id) {
    return this.request(`technologies/${id}/templates/`);
  }

  async getTechnologyRoadmap(id) {
    return this.request(`technologies/${id}/roadmap/`);
  }

  // Templates
  async getTemplates(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`templates/${queryString ? "?" + queryString : ""}`);
  }

  async getTemplate(id) {
    return this.request(`templates/${id}/`);
  }

  async favoriteTemplate(id) {
    return this.request(`templates/${id}/favorite/`, {
      method: "POST",
    });
  }

  async startProject(templateId, projectData) {
    return this.request(`templates/${templateId}/start_project/`, {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  }

  async exportTemplateMarkdown(id) {
    const url = `${this.baseURL}templates/${id}/export_markdown/`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
  }

  // Projetos
  async getProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`projects/${queryString ? "?" + queryString : ""}`);
  }

  async getProject(id) {
    return this.request(`projects/${id}/`);
  }

  async createProject(projectData) {
    return this.request("projects/", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    return this.request(`projects/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id) {
    return this.request(`projects/${id}/`, {
      method: "DELETE",
    });
  }

  async addProjectResponse(projectId, responseData) {
    return this.request(`projects/${projectId}/add_response/`, {
      method: "POST",
      body: JSON.stringify(responseData),
    });
  }

  async generateProjectGuide(projectId) {
    return this.request(`projects/${projectId}/generate_guide/`);
  }

  async exportProjectGuide(projectId) {
    const url = `${this.baseURL}projects/${projectId}/export_guide/`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
  }

  // Progresso do usuário
  async getUserProgress() {
    return this.request("progress/");
  }

  async getUserDashboard() {
    return this.request("progress/dashboard/");
  }

  // Favoritos
  async getFavorites() {
    return this.request("favorites/");
  }

  async addFavorite(templateId) {
    return this.request("favorites/", {
      method: "POST",
      body: JSON.stringify({ template_id: templateId }),
    });
  }

  async removeFavorite(favoriteId) {
    return this.request(`favorites/${favoriteId}/`, {
      method: "DELETE",
    });
  }
}

// Instância singleton da API
const apiService = new ApiService();
export default apiService;
