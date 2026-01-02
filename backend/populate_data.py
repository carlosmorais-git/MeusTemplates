#!/usr/bin/env python
"""Script para popular o banco de dados com usuários e templates de exemplo.

Cria 3 usuários (admin + dois usuários) e alguns templates com etapas e snippets
para cada um. Use este script com o ambiente Django configurado.
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.modelos.models import Template, TemplateStep, CodeSnippet


def create_users():
    User = get_user_model()
    users_data = [
        {"username": "admin", "email": "admin@example.com", "password": "admin123", "is_superuser": True, "is_staff": True},
        {"username": "alice", "email": "alice@example.com", "password": "alicepass"},
        {"username": "bob", "email": "bob@example.com", "password": "bobpass"},
    ]

    created_users = []
    for u in users_data:
        user, created = User.objects.get_or_create(username=u["username"], defaults={"email": u.get("email", "")})
        if created:
            user.set_password(u["password"])
            user.is_staff = u.get("is_staff", False)
            user.is_superuser = u.get("is_superuser", False)
            user.save()
            print(f"Usuário criado: {user.username}")
        else:
            print(f"Usuário já existe: {user.username}")
        created_users.append(user)

    return created_users


def create_sample_templates(users):
    """Cria alguns templates para cada usuário"""
    samples = [
        {
            "technology": "Django",
            "name": "Setup Inicial Django",
            "description": "Passos para iniciar um projeto Django com REST API e autenticação.",
            "steps": [
                {"question": "Criar projeto e app?", "step_type": "boolean", "order": 1},
                {"question": "Configurar banco de dados?", "step_type": "boolean", "order": 2},
                {"question": "Adicionar autenticação?", "step_type": "boolean", "order": 3},
            ],
            "snippets": [
                {"order": 1, "language": "bash", "code": "django-admin startproject mysite", "description": "Criar projeto"},
            ],
        },
        {
            "technology": "React",
            "name": "Criar App React",
            "description": "Checklist para iniciar app React com Vite.",
            "steps": [
                {"question": "Iniciar Vite?", "step_type": "boolean", "order": 1},
                {"question": "Instalar dependências?", "step_type": "boolean", "order": 2},
            ],
            "snippets": [
                {"order": 1, "language": "bash", "code": "pnpm create vite@latest my-app --template react", "description": "Criar app com Vite"},
            ],
        },
        {
            "technology": "API REST",
            "name": "Criar Endpoint CRUD",
            "description": "Checklist para criar endpoint CRUD com Django REST Framework.",
            "steps": [
                {"question": "Criar serializer?", "step_type": "boolean", "order": 1},
                {"question": "Criar viewset?", "step_type": "boolean", "order": 2},
            ],
            "snippets": [
                {"order": 2, "language": "python", "code": "class MyModelViewSet(viewsets.ModelViewSet): pass", "description": "Exemplo de ViewSet"},
            ],
        },
    ]

    created = []
    for i, user in enumerate(users):
        # Para cada usuário, criar um template baseado em samples circularmente
        sample = samples[i % len(samples)]
        template, t_created = Template.objects.get_or_create(
            technology=sample["technology"],
            name=f"{sample['name']} - {user.username}",
            defaults={
                "description": sample["description"],
                "version": "1.0",
                "is_public": True,
                "created_by": user,
            },
        )

        if t_created:
            # criar steps
            for s in sample["steps"]:
                step = TemplateStep.objects.create(template=template, question=s["question"], description=s.get("description", ""), step_type=s.get("step_type", "boolean"), is_required=True, order=s["order"])
            # criar snippets ligados a passos existentes (se order encontrado)
            for sn in sample["snippets"]:
                try:
                    step = template.steps.get(order=sn.get("order", 1))
                except TemplateStep.DoesNotExist:
                    step = template.steps.first()
                CodeSnippet.objects.create(template_step=step, language=sn["language"], code=sn["code"], description=sn.get("description", ""))

        print(f"{'Criado' if t_created else 'Já existe'}: {template.name} (owner: {user.username})")
        created.append(template)

    return created


def main():
    print("🚀 Populando banco de dados com usuários e templates de exemplo...")

    users = create_users()
    create_sample_templates(users)

    print("\n✅ População concluída.")
    print("\nUsuários criados (com senhas em claro):")
    print(" - admin / admin123")
    print(" - alice / alicepass")
    print(" - bob / bobpass")
    print("\nVocê pode testar login via `/api-auth/login/` ou pelo admin em /admin/.")


if __name__ == '__main__':
    main()

