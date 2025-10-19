# Dicas Iniciais para Debug Django no VS Code

## Como iniciar o debug
- Abra o VS Code e selecione "Run and Debug".
- Escolha a configuração "Debug Django".
- O terminal será aberto automaticamente e o ambiente Python ativado.

## Recursos úteis durante o debug
- **Breakpoints**: Clique à esquerda da linha do código para pausar a execução.
- **Variáveis Locais**: Veja os valores das variáveis no painel “Variables”.
- **Call Stack**: Acompanhe a sequência de chamadas de funções.
- **Watch**: Adicione variáveis ou expressões para monitorar seus valores.
- **Step Over/Into/Out**: Avance linha a linha, entre ou saia de funções.
- **Debug Console**: Execute comandos Python no contexto atual do debug.
- **Hot Reload**: Alterações em arquivos Python geralmente recarregam o servidor automaticamente.

## Dicas rápidas
- Use breakpoints em views, models ou funções que deseja inspecionar.
- Monitore variáveis importantes no painel “Watch”.
- Aproveite o “Debug Console” para testar comandos rapidamente.
- Se precisar debugar testes, configure o launch.json para rodar o arquivo de testes.

Se quiser dicas específicas para algum caso, adicione aqui ou peça ajuda!
