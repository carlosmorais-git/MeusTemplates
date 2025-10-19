
@REM Comando para configurar o ambiente de teste Django

@REM Parameterized é usado para testes parametrizados
pip install parameterized
EXEMPLE:
@REM Exemplo de uso do Parameterized
from parameterized import parameterized

class MyTests(TestCase):

    @parameterized.expand([
        ("caso1", "entrada1", "saida1"),
        ("caso2", "entrada2", "saida2"),
    ])
    def test_meu_metodo(self, nome_caso, entrada, saida_esperada):
        resultado = meu_metodo(entrada)
        self.assertEqual(resultado, saida_esperada)

@REM Coverage é usado para medir a cobertura dos testes
pip install coverage
EXEMPLE:
@REM Comando para rodar os testes com coverage
coverage run -m pytest
coverage run -m manage.py test
coverage report
coverage html
@REM O relatório HTML será gerado na pasta htmlcov
@REM Abra o arquivo htmlcov/index.html no navegador para ver o relatório
@REM Para rodar os testes normalmente sem coverage
@REM python manage.py test