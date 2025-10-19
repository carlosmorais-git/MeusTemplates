# Testes de Models - Guia prático
# --------------------------------
# Cada teste está comentado para explicar o que está sendo validado.

from .core_classes_base import CoreModelTest
from apps.core.models import (
	Technology, ProjectResponse,Template, Technology
)
from django.contrib.auth.models import User

from django.core.exceptions import ValidationError
from rich import print as rprint
from django.test import TestCase, RequestFactory
from apps.core.admin import TemplateAdmin

class TechnologyModelTest(CoreModelTest):
	def setUp(self) -> None:
		self.tech = self.create_technology(name="Django RESTFramework", icon="🌐")
		return super().setUp()
	def test_create_technology(self):
		"""Testa a criação de uma tecnologia e seus campos principais."""
		self.assertEqual(str(self.tech), f"{self.tech.icon} {self.tech.name}")
		rprint("\n\n *** Tecnologia criada: ***", self.tech)

	def test_nome_obrigatorio(self):
		"""Testa que o nome da tecnologia é obrigatório. Caso não seja fornecido, deve gerar um erro de integridade."""
		tech = Technology.objects.create(description="cas", icon="🎃", color="#89331D")
		with self.assertRaises(ValidationError):
			tech.full_clean()  # Valida os campos obrigatórios

class TemplateModelTest(CoreModelTest):
	def setUp(self):
		self.tech = self.create_technology(name="React")
		self.template = self.create_template(technology=self.tech, name="Checklist React", description="Checklist básico")
		return super().setUp()
	def test_create_template(self):
		"""Testa a criação de um template vinculado a uma tecnologia."""
		
		self.assertIn(self.tech.name, str(self.template))
		rprint("\n\n ***Template criado: ***", self.template)

class TemplateStepModelTest(CoreModelTest):
	
	def test_create_step(self):
		"""Testa a criação de uma etapa de template."""		
		step = self.create_template_step(question="React instalado?", order=1)
		self.assertTrue(step.is_required)
		rprint("\n\n ***Etapa criada: ***", step)

class ProjectModelTest(CoreModelTest):
	def setUp(self):
		self.user = self.create_user()
		self.tech = self.create_technology(name="Python", icon="🐍", color="#3776AB")
		self.template = self.create_template(technology=self.tech, name="Checklist Python", description="Desc", created_by=self.user)
		self.project = self.create_project(status="draft", user=self.user, template=self.template, name="Projeto Teste")
		self.progress = self.create_user_progress(user=self.user, technology=self.tech)
		return super().setUp()
	def test_create_project(self):
		"""Testa a criação de um projeto."""
		self.assertEqual(self.project.progress_percentage, 0)
		rprint("\n\n *** Projeto criado: ***", self.project)

	def test_calculate_progress(self):
		"""Testa o cálculo de progresso do projeto."""
		self.assertEqual(self.project.calculate_progress(), 0)
		rprint("\n\n *** Progresso do projeto: ***", self.project.calculate_progress())


class ProjectResponseModelTest(CoreModelTest):
	def setUp(self):
		self.user = self.create_user()
		self.tech = self.create_technology(name="Node")
		self.template = self.create_template(technology=self.tech, created_by=self.user)
		self.step = self.create_template_step(template=self.template, question="Node instalado?", order=1)
		self.project = self.create_project(user=self.user, template=self.template, name="Projeto Node", status="draft")
		return super().setUp()
	def test_create_response(self):
		"""Testa a resposta de uma etapa do projeto."""
		response = ProjectResponse.objects.create(project=self.project, template_step=self.step, answer="Sim", is_completed=True)
		self.assertTrue(response.is_completed)
		rprint("\n\n *** Resposta criada:***", response)

class CodeSnippetModelTest(CoreModelTest):
	def setUp(self):
		self.user = self.create_user()
		self.tech = self.create_technology(name="Flask", description="Microframework", icon="🍶", color="#000000")
		self.template = self.create_template(technology=self.tech, name="Checklist Flask", created_by=self.user)
		self.step = self.create_template_step(template=self.template, question="Flask instalado?", order=1)
		return super().setUp()
	def test_create_snippet(self):
		"""Testa a criação de um snippet de código."""
		snippet = self.create_code_snippet(template_step=self.step, language="python", code="print('Hello')")
		self.assertEqual(snippet.language, "python")
		rprint("\n\n *** Snippet criado: ***", snippet)

class UserProgressModelTest(CoreModelTest):
	def setUp(self):
		self.user = self.create_user(username="tester6", password="123")
		self.tech = self.create_technology(name="Angular", description="Outro JS", icon="🅰️", color="#DD0031")
		return super().setUp()
	def test_add_badge_and_level(self):
		"""Testa badges e cálculo de nível do usuário."""
		progress = self.create_user_progress(user=self.user, technology=self.tech)
		progress.add_badge("Primeiro Projeto")
		self.assertIn("Primeiro Projeto", progress.badges)
		progress.projects_completed = 6
		level = progress.calculate_level()
		self.assertEqual(level, 3)
		rprint("\n\n *** Progresso criado: ***", progress)
		rprint("\n Badges:", progress.badges)
		rprint("\n Nível calculado:", level)

class FavoriteModelTest(CoreModelTest):
	def setUp(self):		
		self.user = self.create_user()
		self.tech = self.create_technology(name="Svelte", description="JS", icon="🧡", color="#FF3E00")
		self.template = self.create_template(technology=self.tech, name="Checklist Svelte", created_by=self.user)
		return super().setUp()
	
	def test_favorite(self):
		"""Testa favoritar um template."""
		fav = self.create_favorite(user=self.user, template=self.template)		
		self.assertEqual(str(fav), f"{self.user.username} ❤️ {self.template.name}")
		rprint("\n\n *** Favorito criado: ***", fav)

class TemplateAdminTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_superuser('admin', 'admin@test.com', '123')
        self.tech = Technology.objects.create(name="React", description="desc", icon="⚛️", color="#61DAFB")

    def test_save_model_sets_created_by(self):
        request = self.factory.post('/admin/core/template/add/')
        request.user = self.user
        admin = TemplateAdmin(Template, None)
        template = Template(technology=self.tech, name="Test", description="desc")
        admin.save_model(request, template, form=None, change=False)
        self.assertEqual(template.created_by, self.user)

    def test_save_model_edit_does_not_set_created_by(self):
        request = self.factory.post('/admin/core/template/1/change/')
        request.user = self.user
        admin = TemplateAdmin(Template, None)
        template = Template(technology=self.tech, name="Test", description="desc", created_by=self.user)
        admin.save_model(request, template, form=None, change=True)
        self.assertEqual(template.created_by, self.user)