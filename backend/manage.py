#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()

# salvar minhas dependencias
# Use o terminal para instalar dependências: pip install -r requirements.txt
# pip freeze > requirements.txt
# criar ambiente virtual: python -m venv venv
# ativar ambiente virtual: .\venv\Scripts\activate (Windows)
# # desativar o ambiente virtual: deactivate