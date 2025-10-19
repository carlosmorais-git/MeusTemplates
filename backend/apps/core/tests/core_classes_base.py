# Arquivo conterá classes reutilizáveis para tests na criacao de usuario, tecnologia, etc
from django.test import TestCase
from django.contrib.auth.models import User
from apps.core.models import (
	Technology, Template, TemplateStep, Project, ProjectResponse,
	CodeSnippet, UserProgress, Favorite
)

class CoreModelTest(TestCase):
	# construtores reutilizáveis para os testes
	def setUp(self) -> None:

		super().setUp()


	# Usuário
	def create_user(self, 
				 username="testUser", 
				 password="123"):
		
		return User.objects.create_user(username=username, password=password)

	# Tecnologia
	def create_technology(self, 
					   name="Django", 
					   description="Framework web Python", 
					   icon="🐍", 
					   color="#092E20"):
		
		return Technology.objects.create(name=name, description=description, icon=icon, color=color)

	def create_technology_errors(self, 
								  name="", 
								  description="", 
								  icon="", 
								  color=""):
		"""Cria uma tecnologia e força a validação de erros."""
		tech = Technology(name=name, description=description, icon=icon, color=color)
		tech.full_clean()  # Força a validação
		return tech

	# Template
	def create_template(self, 
					 technology=None, 
					 name="Checklist Django", 
					 description="Checklist básico", 
					 created_by=None):
		
		technology = technology or self.create_technology()
		created_by = created_by or self.create_user()

		return Template.objects.create(technology=technology, name=name, description=description, created_by=created_by)

	# TemplateStep
	def create_template_step(self, 
						  template=None, 
						  question="Instalou?", 
						  order=1):
		
		template = template or self.create_template()

		return TemplateStep.objects.create(template=template, question=question, order=order)

	# Projeto
	def create_project(self, 
					user=None, 
					template=None, 
					name="Meu Projeto", 
					status="draft"):
		
		user = user or self.create_user()
		template = template or self.create_template()

		return Project.objects.create(user=user, template=template, name=name, status=status)

	# ProjectResponse
	def create_project_response(self, 
							 project=None, 
							 template_step=None, 
							 answer="Sim", 
							 is_completed=True):
		
		project = project or self.create_project()
		template_step = template_step or self.create_template_step()

		return ProjectResponse.objects.create(project=project, template_step=template_step, answer=answer, is_completed=is_completed)

	# CodeSnippet
	def create_code_snippet(self, 
						 template_step=None, 
						 language="python", 
						 code="print('Hello')"):
		
		template_step = template_step or self.create_template_step()

		return CodeSnippet.objects.create(template_step=template_step, language=language, code=code)

	# UserProgress
	def create_user_progress(self, 
						  user=None, 
						  technology=None):
		
		user = user or self.create_user()
		technology = technology or self.create_technology()

		return UserProgress.objects.create(user=user, technology=technology)

	# Favorite
	def create_favorite(self, 
					 user=None, 
					 template=None):
		
		user = user or self.create_user()
		template = template or self.create_template()
		return Favorite.objects.create(user=user, template=template)
