// Arquivo usado para testar a chamada da api
// Usando Jest para mockar fetch e testar as funções do apiService
// Pra chamar os testes, use `npm test` ou `yarn test`

// Mock global fetch - usado para simular chamadas de rede 'TESTES ISOLADOS'
// globalThis.fetch = jest.fn();

import apiService from "./api";

// Jest globals for test environment
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

describe("ApiService", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const mockJson = jest.fn();
  const mockBlob = jest.fn();

  function mockFetchOk(data) {
    fetch.mockResolvedValue({
      ok: true,
      json: mockJson.mockResolvedValue(data),
      blob: mockBlob.mockResolvedValue(data),
    });
  }

  function mockFetchFail(status = 500) {
    fetch.mockResolvedValue({
      ok: false,
      status,
      json: mockJson,
      blob: mockBlob,
    });
  }

  it("getTechnologies calls correct endpoint", async () => {
    mockFetchOk(["tech1", "tech2"]);
    const data = await apiService.getTechnologies();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/technologies/"),
      expect.any(Object)
    );
    expect(data).toEqual(["tech1", "tech2"]);
  });

  it("getTechnology calls correct endpoint", async () => {
    mockFetchOk({ id: 1 });
    const data = await apiService.getTechnology(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/technologies/1/"),
      expect.any(Object)
    );
    expect(data).toEqual({ id: 1 });
  });

  it("getTechnologyTemplates calls correct endpoint", async () => {
    mockFetchOk(["template"]);
    const data = await apiService.getTechnologyTemplates(2);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/technologies/2/templates/"),
      expect.any(Object)
    );
    expect(data).toEqual(["template"]);
  });

  it("getTechnologyRoadmap calls correct endpoint", async () => {
    mockFetchOk(["roadmap"]);
    const data = await apiService.getTechnologyRoadmap(3);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/technologies/3/roadmap/"),
      expect.any(Object)
    );
    expect(data).toEqual(["roadmap"]);
  });

  it("getTemplates calls correct endpoint with params", async () => {
    mockFetchOk(["template"]);
    const params = { search: "abc" };
    const data = await apiService.getTemplates(params);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/templates/?search=abc"),
      expect.any(Object)
    );
    expect(data).toEqual(["template"]);
  });

  it("getTemplate calls correct endpoint", async () => {
    mockFetchOk({ id: 1 });
    const data = await apiService.getTemplate(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/templates/1/"),
      expect.any(Object)
    );
    expect(data).toEqual({ id: 1 });
  });

  it("favoriteTemplate calls correct endpoint", async () => {
    mockFetchOk({ success: true });
    const data = await apiService.favoriteTemplate(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/templates/1/favorite/"),
      expect.objectContaining({ method: "POST" })
    );
    expect(data).toEqual({ success: true });
  });

  it("startProject calls correct endpoint", async () => {
    mockFetchOk({ project: "started" });
    const data = await apiService.startProject(1, { name: "proj" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/templates/1/start_project/"),
      expect.objectContaining({ method: "POST" })
    );
    expect(data).toEqual({ project: "started" });
  });

  it("exportTemplateMarkdown returns blob", async () => {
    mockFetchOk("blobdata");
    const result = await apiService.exportTemplateMarkdown(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/templates/1/export_markdown/")
    );
    expect(result).toBe("blobdata");
  });

  it("getProjects calls correct endpoint with params", async () => {
    mockFetchOk(["project"]);
    const params = { status: "active" };
    const data = await apiService.getProjects(params);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/projects/?status=active"),
      expect.any(Object)
    );
    expect(data).toEqual(["project"]);
  });

  it("getProject calls correct endpoint", async () => {
    mockFetchOk({ id: 1 });
    const data = await apiService.getProject(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/projects/1/"),
      expect.any(Object)
    );
    expect(data).toEqual({ id: 1 });
  });

  it("createProject calls correct endpoint", async () => {
    mockFetchOk({ id: 2 });
    const data = await apiService.createProject({ name: "new" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/projects/"),
      expect.objectContaining({ method: "POST" })
    );
    expect(data).toEqual({ id: 2 });
  });

  it("updateProject calls correct endpoint", async () => {
    mockFetchOk({ id: 3 });
    const data = await apiService.updateProject(3, { name: "upd" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/projects/3/"),
      expect.objectContaining({ method: "PATCH" })
    );
    expect(data).toEqual({ id: 3 });
  });

  it("deleteProject calls correct endpoint", async () => {
    mockFetchOk({ deleted: true });
    const data = await apiService.deleteProject(4);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/projects/4/"),
      expect.objectContaining({ method: "DELETE" })
    );
    expect(data).toEqual({ deleted: true });
  });

  it("addProjectResponse calls correct endpoint", async () => {
    mockFetchOk({ response: "added" });
    const data = await apiService.addProjectResponse(5, { answer: "yes" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/projects/5/add_response/"),
      expect.objectContaining({ method: "POST" })
    );
    expect(data).toEqual({ response: "added" });
  });

  it("generateProjectGuide calls correct endpoint", async () => {
    mockFetchOk({ guide: "generated" });
    const data = await apiService.generateProjectGuide(6);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/projects/6/generate_guide/"),
      expect.any(Object)
    );
    expect(data).toEqual({ guide: "generated" });
  });

  it("exportProjectGuide returns blob", async () => {
    mockFetchOk("guideblob");
    const result = await apiService.exportProjectGuide(7);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/projects/7/export_guide/")
    );
    expect(result).toBe("guideblob");
  });

  it("getUserProgress calls correct endpoint", async () => {
    mockFetchOk({ progress: 100 });
    const data = await apiService.getUserProgress();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/progress/"),
      expect.any(Object)
    );
    expect(data).toEqual({ progress: 100 });
  });

  it("getUserDashboard calls correct endpoint", async () => {
    mockFetchOk({ dashboard: true });
    const data = await apiService.getUserDashboard();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/progress/dashboard/"),
      expect.any(Object)
    );
    expect(data).toEqual({ dashboard: true });
  });

  it("getFavorites calls correct endpoint", async () => {
    mockFetchOk(["fav"]);
    const data = await apiService.getFavorites();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/favorites/"),
      expect.any(Object)
    );
    expect(data).toEqual(["fav"]);
  });

  it("addFavorite calls correct endpoint", async () => {
    mockFetchOk({ added: true });
    const data = await apiService.addFavorite(8);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/favorites/"),
      expect.objectContaining({ method: "POST" })
    );
    expect(data).toEqual({ added: true });
  });

  it("removeFavorite calls correct endpoint", async () => {
    mockFetchOk({ removed: true });
    const data = await apiService.removeFavorite(9);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/favorites/9/"),
      expect.objectContaining({ method: "DELETE" })
    );
    expect(data).toEqual({ removed: true });
  });

  it("throws error on failed fetch", async () => {
    mockFetchFail(404);
    await expect(apiService.getTechnology(999)).rejects.toThrow(
      "HTTP error! status: 404"
    );
  });
});
