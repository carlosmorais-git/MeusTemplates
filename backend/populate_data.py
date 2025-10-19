#!/usr/bin/env python
"""
Script para popular o banco de dados com dados de exemplo
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from apps.core.models import Technology, Template, TemplateStep, CodeSnippet


def create_technologies():
    """Criar tecnologias de exemplo"""
    technologies = [
        {
            'name': 'Django',
            'description': 'Framework web Python para desenvolvimento rápido e limpo',
            'icon': '🐍',
            'color': '#092E20',
            'documentation_url': 'https://docs.djangoproject.com/'
        },
        {
            'name': 'React Native',
            'description': 'Framework para desenvolvimento de apps móveis multiplataforma',
            'icon': '📱',
            'color': '#61DAFB',
            'documentation_url': 'https://reactnative.dev/'
        },
        {
            'name': 'Node.js',
            'description': 'Runtime JavaScript para desenvolvimento backend',
            'icon': '🟢',
            'color': '#339933',
            'documentation_url': 'https://nodejs.org/'
        },
        {
            'name': 'Flutter',
            'description': 'Framework Google para desenvolvimento de apps multiplataforma',
            'icon': '🦋',
            'color': '#02569B',
            'documentation_url': 'https://flutter.dev/'
        },
        {
            'name': 'API REST',
            'description': 'Desenvolvimento de APIs RESTful',
            'icon': '🔗',
            'color': '#FF6B35',
            'documentation_url': 'https://restfulapi.net/'
        }
    ]
    
    created_techs = []
    for tech_data in technologies:
        tech, created = Technology.objects.get_or_create(
            name=tech_data['name'],
            defaults=tech_data
        )
        created_techs.append(tech)
        print(f"{'Criada' if created else 'Já existe'}: {tech.name}")
    
    return created_techs


def create_django_template(django_tech):
    """Criar template para Django"""
    template, created = Template.objects.get_or_create(
        technology=django_tech,
        name='Adicionar Nova Funcionalidade',
        defaults={
            'description': 'Checklist completo para adicionar uma nova funcionalidade em projetos Django',
            'version': '1.0',
            'is_public': True,
            'created_by_id': 1  # Admin user
        }
    )
    
    if created:
        steps_data = [
            {
                'question': 'Qual é o objetivo da funcionalidade?',
                'description': 'Descreva claramente o que a funcionalidade deve fazer e qual problema resolve.',
                'step_type': 'text',
                'order': 1
            },
            {
                'question': 'Precisa de um modelo (Model)?',
                'description': 'A funcionalidade vai armazenar dados no banco? Se sim, você precisará criar um novo modelo.',
                'step_type': 'boolean',
                'order': 2
            },
            {
                'question': 'Precisa de autenticação/autorização?',
                'description': 'A funcionalidade será pública ou depende do login do usuário?',
                'step_type': 'boolean',
                'order': 3
            },
            {
                'question': 'Vai criar rota nova (endpoint)?',
                'description': 'Precisa de uma nova URL para acessar a funcionalidade?',
                'step_type': 'boolean',
                'order': 4
            },
            {
                'question': 'Vai se relacionar com outros modelos?',
                'description': 'A nova funcionalidade vai usar dados de outras tabelas?',
                'step_type': 'boolean',
                'order': 5
            },
            {
                'question': 'Qual tipo de operação é?',
                'description': 'Selecione o tipo de operação HTTP que será implementada.',
                'step_type': 'choice',
                'choices': ['GET (listar/visualizar)', 'POST (criar)', 'PUT/PATCH (editar)', 'DELETE (remover)', 'Múltiplas operações'],
                'order': 6
            },
            {
                'question': 'Vai impactar a UI ou fluxo do usuário?',
                'description': 'A mudança afeta a experiência visual ou lógica do frontend?',
                'step_type': 'boolean',
                'order': 7
            },
            {
                'question': 'Tem alguma regra de negócio envolvida?',
                'description': 'Descreva qualquer lógica específica que deve ser seguida.',
                'step_type': 'text',
                'order': 8
            },
            {
                'question': 'Como vai testar a funcionalidade?',
                'description': 'Descreva como você vai validar se está funcionando corretamente.',
                'step_type': 'text',
                'order': 9
            },
            {
                'question': 'Precisa de migrações?',
                'description': 'Se criou/modificou modelos, será necessário gerar e aplicar migrações.',
                'step_type': 'boolean',
                'order': 10
            }
        ]
        
        for step_data in steps_data:
            TemplateStep.objects.create(template=template, **step_data)
        
        # Adicionar alguns snippets de código
        model_step = template.steps.get(order=2)
        CodeSnippet.objects.create(
            template_step=model_step,
            language='python',
            code='''class MinhaFuncionalidade(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.nome''',
            description='Exemplo de modelo Django básico'
        )
        
        view_step = template.steps.get(order=4)
        CodeSnippet.objects.create(
            template_step=view_step,
            language='python',
            code='''from rest_framework import viewsets
from .models import MinhaFuncionalidade
from .serializers import MinhaFuncionalidadeSerializer

class MinhaFuncionalidadeViewSet(viewsets.ModelViewSet):
    queryset = MinhaFuncionalidade.objects.all()
    serializer_class = MinhaFuncionalidadeSerializer''',
            description='Exemplo de ViewSet para API REST'
        )
    
    print(f"{'Criado' if created else 'Já existe'}: Template Django")
    return template


def create_react_native_template(rn_tech):
    """Criar template para React Native"""
    template, created = Template.objects.get_or_create(
        technology=rn_tech,
        name='Criar Nova Tela',
        defaults={
            'description': 'Checklist para criar uma nova tela em aplicativos React Native',
            'version': '1.0',
            'is_public': True,
            'created_by_id': 1
        }
    )
    
    if created:
        steps_data = [
            {
                'question': 'Qual é o propósito da tela?',
                'description': 'Descreva o que a tela vai fazer e qual sua função no app.',
                'step_type': 'text',
                'order': 1
            },
            {
                'question': 'Precisa de navegação?',
                'description': 'A tela será acessada através de navegação? Que tipo?',
                'step_type': 'choice',
                'choices': ['Stack Navigation', 'Tab Navigation', 'Drawer Navigation', 'Modal', 'Não precisa'],
                'order': 2
            },
            {
                'question': 'Vai consumir API?',
                'description': 'A tela precisa buscar dados de uma API externa?',
                'step_type': 'boolean',
                'order': 3
            },
            {
                'question': 'Precisa de estado local ou global?',
                'description': 'Como será gerenciado o estado dos dados na tela?',
                'step_type': 'choice',
                'choices': ['useState (local)', 'Context API', 'Redux', 'Zustand', 'Não precisa'],
                'order': 4
            },
            {
                'question': 'Vai usar componentes customizados?',
                'description': 'A tela vai precisar de componentes específicos criados por você?',
                'step_type': 'boolean',
                'order': 5
            },
            {
                'question': 'Precisa de animações?',
                'description': 'A tela terá transições, animações ou efeitos visuais?',
                'step_type': 'boolean',
                'order': 6
            },
            {
                'question': 'Vai funcionar offline?',
                'description': 'A tela precisa funcionar sem conexão com internet?',
                'step_type': 'boolean',
                'order': 7
            },
            {
                'question': 'Precisa de permissões do dispositivo?',
                'description': 'A tela vai acessar câmera, localização, contatos, etc?',
                'step_type': 'text',
                'order': 8
            },
            {
                'question': 'Como vai ser o layout?',
                'description': 'Que tipo de layout e componentes vai usar?',
                'step_type': 'choice',
                'choices': ['ScrollView', 'FlatList', 'SectionList', 'View simples', 'KeyboardAvoidingView'],
                'order': 9
            },
            {
                'question': 'Precisa de validação de formulário?',
                'description': 'A tela tem formulários que precisam ser validados?',
                'step_type': 'boolean',
                'order': 10
            }
        ]
        
        for step_data in steps_data:
            TemplateStep.objects.create(template=template, **step_data)
    
    print(f"{'Criado' if created else 'Já existe'}: Template React Native")
    return template


def create_api_template(api_tech):
    """Criar template para API REST"""
    template, created = Template.objects.get_or_create(
        technology=api_tech,
        name='Criar Novo Endpoint',
        defaults={
            'description': 'Checklist para criar um novo endpoint de API REST',
            'version': '1.0',
            'is_public': True,
            'created_by_id': 1
        }
    )
    
    if created:
        steps_data = [
            {
                'question': 'Qual é o recurso que a API vai gerenciar?',
                'description': 'Defina claramente qual entidade/recurso será manipulado.',
                'step_type': 'text',
                'order': 1
            },
            {
                'question': 'Quais métodos HTTP vai suportar?',
                'description': 'Selecione os métodos que o endpoint vai implementar.',
                'step_type': 'choice',
                'choices': ['GET apenas', 'POST apenas', 'GET e POST', 'CRUD completo (GET, POST, PUT, DELETE)', 'Customizado'],
                'order': 2
            },
            {
                'question': 'Precisa de autenticação?',
                'description': 'O endpoint será público ou requer autenticação?',
                'step_type': 'choice',
                'choices': ['Público', 'JWT Token', 'API Key', 'OAuth', 'Basic Auth'],
                'order': 3
            },
            {
                'question': 'Qual é a estrutura dos dados de entrada?',
                'description': 'Descreva o formato JSON que o endpoint vai receber.',
                'step_type': 'code',
                'order': 4
            },
            {
                'question': 'Qual é a estrutura dos dados de saída?',
                'description': 'Descreva o formato JSON que o endpoint vai retornar.',
                'step_type': 'code',
                'order': 5
            },
            {
                'question': 'Precisa de validação de dados?',
                'description': 'Que validações serão aplicadas nos dados recebidos?',
                'step_type': 'text',
                'order': 6
            },
            {
                'question': 'Vai ter paginação?',
                'description': 'Para listagens, será implementada paginação?',
                'step_type': 'boolean',
                'order': 7
            },
            {
                'question': 'Precisa de filtros ou busca?',
                'description': 'O endpoint permitirá filtrar ou buscar dados?',
                'step_type': 'boolean',
                'order': 8
            },
            {
                'question': 'Como vai tratar erros?',
                'description': 'Defina os códigos de erro e mensagens que serão retornados.',
                'step_type': 'text',
                'order': 9
            },
            {
                'question': 'Precisa de documentação?',
                'description': 'Será gerada documentação automática (Swagger/OpenAPI)?',
                'step_type': 'boolean',
                'order': 10
            }
        ]
        
        for step_data in steps_data:
            TemplateStep.objects.create(template=template, **step_data)
    
    print(f"{'Criado' if created else 'Já existe'}: Template API REST")
    return template


def main():
    print("🚀 Populando banco de dados com dados de exemplo...")
    
    # Criar tecnologias
    technologies = create_technologies()
    
    # Encontrar tecnologias específicas
    django_tech = next(t for t in technologies if t.name == 'Django')
    rn_tech = next(t for t in technologies if t.name == 'React Native')
    api_tech = next(t for t in technologies if t.name == 'API REST')
    
    # Criar templates
    create_django_template(django_tech)
    create_react_native_template(rn_tech)
    create_api_template(api_tech)
    
    print("\n✅ Dados de exemplo criados com sucesso!")
    print("\n📊 Resumo:")
    print(f"- Tecnologias: {Technology.objects.count()}")
    print(f"- Templates: {Template.objects.count()}")
    print(f"- Etapas: {TemplateStep.objects.count()}")
    print(f"- Snippets: {CodeSnippet.objects.count()}")
    
    print("\n🔗 Acesse o admin em: http://localhost:8000/admin/")
    print("   Usuário: admin")
    print("   Senha: admin123")


if __name__ == '__main__':
    main()

