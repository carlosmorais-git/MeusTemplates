from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User
from apps.core.models import Template, Technology
from apps.core.admin import TemplateAdmin

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