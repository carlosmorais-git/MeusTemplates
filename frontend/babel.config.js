//  O arquivo babel.config.js na raiz do projeto React (panel_frontend)
// é muito importante para configurar o Babel, que é o compilador JavaScript usado
// por ferramentas como o Jest para transformar o código moderno em uma versão
// compatível com o ambiente de teste.

// Em resumo o babel serve pra garantir que o código JavaScript, incluindo JSX,
// seja corretamente interpretado durante os testes, evitando erros de sintaxe
// ou incompatibilidades.

export default {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-react",
  ],
};
