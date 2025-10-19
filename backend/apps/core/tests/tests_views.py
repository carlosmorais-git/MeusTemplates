# Testes de Views/API - Guia prático
# ----------------------------------
# Cada teste está comentado para explicar o que está sendo validado.

from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from apps.core.models import Technology, Template
from rich import print as rprint

class TechnologyViewSetTest(APITestCase):
	def setUp(self):
		self.tech = Technology.objects.create(name="Django", description="Framework", icon="🐍", color="#092E20")
		self.user = User.objects.create_user(username="tester", password="123")

	def test_list_technologies(self):
		"""Testa o endpoint de listagem de tecnologias."""
		url = reverse('technology-list')
		self.client.force_authenticate(user=self.user)
		response = self.client.get(url)
		self.assertEqual(response.status_code, 200)
		self.assertGreaterEqual(len(response.data), 1)
		rprint("\n\n *** Tecnologias retornadas: ***", response.data)

class TemplateViewSetTest(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(username="tester", password="123")
		self.tech = Technology.objects.create(name="React", description="JS", icon="⚛️", color="#61DAFB")
		self.template = Template.objects.create(technology=self.tech, name="Checklist React", description="Desc", created_by=self.user)

	def test_list_templates(self):
		"""Testa o endpoint de listagem de templates."""
		url = reverse('template-list')
		self.client.force_authenticate(user=self.user)
		response = self.client.get(url)
		self.assertEqual(response.status_code, 200)
		self.assertGreaterEqual(len(response.data), 1)
		rprint("\n\n *** Templates retornados: ***", response.data)

	def test_favorite_template(self):
		"""Testa favoritar um template via API."""
		self.client.force_authenticate(user=self.user)
		url = reverse('template-favorite', args=[self.template.id])
		response = self.client.post(url)
		self.assertEqual(response.status_code, 200)
		self.assertIn('favorited', response.data)
		rprint("\n\n *** Favoritar template - resposta: ***", response.data)
