# Testes de Serializers - Guia prático
# ------------------------------------
# Cada teste está comentado para explicar o que está sendo validado.

from django.test import TestCase
from django.contrib.auth.models import User
from apps.core.models import Technology, Template, TemplateStep, Project
from apps.core.serializers import (
	TechnologySerializer, TemplateSerializer, TemplateStepSerializer,
	ProjectSerializer, UserSerializer
)

from rich import print as rprint

class TechnologySerializerTest(TestCase):
	def test_serialize_technology(self):
		"""Testa serialização de uma tecnologia."""
		tech = Technology.objects.create(name="Django", description="Framework", icon="🐍", color="#092E20")
		serializer = TechnologySerializer(tech)
		self.assertEqual(serializer.data['name'], "Django")
		rprint("\n\n *** Tecnologia serializada: *** ", serializer.data)

class TemplateSerializerTest(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(username="tester", password="123")
		self.tech = Technology.objects.create(name="React", description="JS", icon="⚛️", color="#61DAFB")

	def test_serialize_template(self):
		"""Testa serialização de um template."""
		template = Template.objects.create(technology=self.tech, name="Checklist React", description="Desc", created_by=self.user)
		serializer = TemplateSerializer(template)
		self.assertEqual(serializer.data['name'], "Checklist React")
		rprint("\n\n ***Template serializado: ***", serializer.data)

class TemplateStepSerializerTest(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(username="tester2", password="123")
		self.tech = Technology.objects.create(name="Python", description="Linguagem", icon="🐍", color="#3776AB")
		self.template = Template.objects.create(technology=self.tech, name="Checklist Python", description="Desc", created_by=self.user)

	def test_serialize_step(self):
		"""Testa serialização de uma etapa."""
		step = TemplateStep.objects.create(template=self.template, question="Instalou o Python?", order=1)
		serializer = TemplateStepSerializer(step)
		self.assertEqual(serializer.data['question'], "Instalou o Python?")
		rprint("\n\n *** Etapa serializada: ***", serializer.data)

class ProjectSerializerTest(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(username="tester3", password="123")
		self.tech = Technology.objects.create(name="Vue", description="Outro JS", icon="🟩", color="#42B883")
		self.template = Template.objects.create(technology=self.tech, name="Checklist Vue", description="Desc", created_by=self.user)

	def test_serialize_project(self):
		"""Testa serialização de um projeto."""
		project = Project.objects.create(user=self.user, template=self.template, name="Meu Projeto", status="draft")
		serializer = ProjectSerializer(project)
		self.assertEqual(serializer.data['name'], "Meu Projeto")
		rprint("\n\n *** Projeto serializado: ***", serializer.data)

class UserSerializerTest(TestCase):
	def test_serialize_user(self):
		"""Testa serialização de um usuário."""
		user = User.objects.create_user(username="tester4", password="123")
		serializer = UserSerializer(user)
		self.assertEqual(serializer.data['username'], "tester4")
		rprint("\n\n *** Usuário serializado: ***", serializer.data)
