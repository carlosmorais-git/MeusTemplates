# 🧩 Painel de Aprendizado — Meus Templates

Um painel interativo desenvolvido para **organizar e criar templates de aprendizado**, com foco em **tecnologias, etapas e visualização em tempo real**.  
O projeto foi aprimorado com **novos modais**, **validação de dados**, **design responsivo** e **organização do código**, integrando **React (Frontend)** e **Django (Backend)**. <br>

<img width="202" height="447" alt="image" src="https://github.com/user-attachments/assets/732ec30b-931d-4469-a052-6e5a4cbcbbe3" /> <img width="203" height="443" alt="image" src="https://github.com/user-attachments/assets/15aa76b3-272a-4969-9c41-9a80c7ccbd22" /> <img width="202" height="449" alt="image" src="https://github.com/user-attachments/assets/512ef04e-202c-42df-9776-1cb91af43f36" /> <img width="205" height="445" alt="image" src="https://github.com/user-attachments/assets/85168e7a-956f-49ae-ad3c-0a22c15f3b99" />





---

## 🚀 Melhorias Implementadas

### 🧠 1. Sistema de Templates Aprimorado

#### 🪄 Modal de Criação (`CreateTemplateModal.jsx`)

- Formulário completo para criação de templates
- Seleção de tecnologia associada
- Adição de tags dinâmicas
- Sistema de múltiplas etapas configuráveis
- Preview em tempo real
- Validação de campos obrigatórios

#### 💡 Página de Templates

- Integração total com o modal
- Interface mais intuitiva e limpa
- Organização clara dos dados

---

### ⚙️ 2. Sistema de Tecnologias

#### 🎨 Modal de Criação (`TechnologyModal.jsx`)

- Adição de novas tecnologias
- Seleção de ícone (emoji ou personalizado)
- Paleta de cores com opções predefinidas
- Campo para link de documentação
- Preview ao vivo
- Validação de campos obrigatórios

#### 💻 Página de Tecnologias

- Botão funcional “Adicionar Tecnologia”
- Dados de exemplo para demonstração
- Interface moderna e responsiva

---

### 🔧 3. Correções Técnicas

- Corrigidos imports faltantes (`useState`, `useEffect`)
- Removidas duplicações e imports incorretos
- Reorganização da estrutura de componentes
- API configurada corretamente com URL base
- Fallback de dados para modo demonstração
- Código limpo, documentado e modular

---

### 🧩 4. Funcionalidades Atuais

#### 🗂️ Templates

✅ Criação de templates com múltiplas etapas  
✅ Sistema de tags dinâmico  
✅ Associação com tecnologia  
✅ Preview interativo  
✅ Validação de formulário

#### 💻 Tecnologias

✅ Adição de novas tecnologias  
✅ Customização visual (ícone e cor)  
✅ Link de documentação  
✅ Preview em tempo real

#### 🎨 Interface

✅ Design responsivo  
✅ Componentes reutilizáveis  
✅ Feedback visual  
✅ Navegação intuitiva

---

## 🧰 Tecnologias Utilizadas

| Categoria    | Tecnologias                           |
| ------------ | ------------------------------------- |
| **Frontend** | React + Vite                          |
| **Backend**  | Django + Django REST Framework        |
| **UI**       | Tailwind CSS, Lucide React Icons      |
| **Estado**   | React Hooks (`useState`, `useEffect`) |

---

## 📁 Estrutura do Projeto

```
painel/
├── panel_backend/          # Backend Django
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── panel_frontend/         # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateTemplateModal.jsx    # ✨ Novo
│   │   │   ├── TechnologyModal.jsx        # ✨ Novo
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Technologies.jsx           # ✨ Melhorado
│   │   │   ├── Templates.jsx              # ✨ Melhorado
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js                     # ✨ Corrigido
│   │   └── App.jsx
└── core/                   # Aplicação Django
    ├── models.py
    ├── views.py
    └── urls.py
```

---

## 🧱 Próximos Passos

### 🔙 Backend

- Implementar endpoints reais para criação de templates e tecnologias
- Adicionar autenticação de usuários
- Implementar sistema de permissões

### 💻 Frontend

- Conectar modais com a API real
- Implementar sistema de notificações e alertas
- Adicionar validações extras
- Filtros e busca avançada

### 🚀 Novas Funcionalidades Futuras

- Sistema de projetos e progresso
- Favoritos e histórico
- Exportação e compartilhamento de templates

---

## ⚙️ Como Executar o Projeto

### 🐍 Backend (Django)

```bash
cd painel
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000
```

### ⚛️ Frontend (React)

```bash
cd painel/panel_frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

### 🌐 URLs de Acesso

- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:8000/api

---

## 🎨 UX/UI Melhorias

- Interface moderna e responsiva
- Feedback visual imediato
- Modais intuitivos e consistentes
- Formulários claros e organizados
- Preview em tempo real
- Validação de campos com mensagens úteis

---

## 🧠 Qualidade e Boas Práticas

- Componentização inteligente
- Código limpo e documentado
- Estrutura modular
- Boas práticas React
- Tratamento de erros robusto
- Estados bem controlados

---

## 🏁 Conclusão

O **Painel de Aprendizado** agora possui uma base sólida, modular e escalável.  
As melhorias aplicadas criam um ambiente ideal para aprendizado, criação e gestão de templates técnicos, com uma **interface moderna e fluída**.  
O projeto está pronto para evoluir em direção a um sistema completo de acompanhamento de aprendizado e produtividade.


