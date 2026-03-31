# 🧠 Pi-6 - Sistema de Apoio ao Idoso

Uma aplicação **React Native + Expo** para uma **empresa solidária** que ajuda idosos a se manterem **fisicamente e mentalmente ativos**.

## 📋 Sobre o Projeto

Este aplicativo permite que **idosos respondam formulários** de avaliação cognitiva e física, facilitando o acompanhamento periódico por cuidadores e administradores.

## ✨ Funcionalidades

### Para o Idoso (Usuário)
- ✅ Login simplificado
- ✅ Recursos de acessibilidade (zoom, fontes ajustáveis)
- ✅ Responder formulários cognitivos e físicos
- ✅ Sistema de rating com estrelas (0-5 com incrementos de 0.5)
- ✅ Interface amigável e intuitiva

### Para o Administrador
- ✅ Gerenciar usuários (ativar/inativar)
- ✅ Criar e editar formulários personalizados
- ✅ Finalizar formulários para liberar visualização de dados
- ✅ Dashboard com acompanhamento de respostas
- ✅ Visualizar quem respondeu e quem falta responder
- ✅ Gráficos de barras e pizza para análise de dados
- ✅ Filtro por tipo de usuário (Admin, Ativos, Inativos)

## 🛠️ Tecnologias

| Tecnologia | Versão |
|------------|--------|
| React Native | 0.81.5 |
| Expo | ~54.0.0 |
| TypeScript | ^5.3.3 |
| Firebase | ^11.0.0 |
| react-native-svg | (gráficos) |

## 🚀 Como Rodar

### Pré-requisitos

- Node.js instalado
- Expo CLI (`npm install -g expo-cli`)

### Passos

1. **Instale as dependências:**
```bash
npm install
```

2. **Inicie o projeto:**
```bash
npm start
```

3. **Execute no dispositivo:**
   - Escaneie o QR code com **Expo Go** (Android/iOS)
   - Ou pressione `a` para Android emulator
   - Ou pressione `i` para iOS simulator

## 📁 Estrutura do Projeto

```
CounterApp/
├── src/
│   ├── components/
│   │   ├── NavBar.tsx
│   │   ├── SideNav.tsx
│   │   ├── StarRating.tsx      # Componente de estrelas (0-5)
│   │   ├── BarChart.tsx        # Gráfico de barras
│   │   └── PieChart.tsx        # Gráfico de pizza
│   ├── screens/
│   │   ├── admin/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── FormulariosScreen.tsx
│   │   │   ├── FormularioBuilderScreen.tsx
│   │   │   ├── RespostasScreen.tsx
│   │   │   ├── UsuariosScreen.tsx
│   │   │   └── ResponderFormularioScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── UsuarioScreen.tsx
│   ├── services/
│   │   ├── formularioService.ts
│   │   ├── respostasService.ts
│   │   └── adminService.ts
│   ├── config/
│   │   └── firebase.ts
│   └── types/
│       └── usuario.ts
├── App.tsx
├── package.json
└── README.md
```

## 📊 Funcionalidades do Dashboard

### Visão Geral por Formulário
- **Progresso**: Exibe "X/Y responderam" (ex: 4/10)
- **Barra de progresso** visual
- **Gráfico de pizza** pequeno (respondidos vs faltantes)
- **Botão "Ver Lista"**: Mostra lista de quem respondeu e quem falta
- **Botão "Ver Dados"**: Libera gráficos detalhados após finalizar formulário

### Finalizar Formulário
- Formulários podem ser **finalizados** para liberar visualização completa dos dados
- Após finalizar, não é mais possível editar o formulário
- Gráficos de barras e médias são exibidos no modal "Ver Dados"

## 🔐 Segurança

- Autenticação via Firebase Authentication
- Dados armazenados no Firestore
- Usuários precisam de aprovação do administrador
- Senhas criptografadas
- Respostas anonimizadas (hash do usuário)

## 📱 Acessibilidade

- **Zoom dinâmico**: Aumente o conteúdo de 80% a 200%
- **Scroll livre**: Navegue em todas as direções
- **Contraste**: Cores adequadas para melhor visibilidade
- **Fontes grandes**: Textos legíveis

## 👥 Tipos de Usuário

| Tipo | Descrição |
|------|-----------|
| **Admin** | Gerencia formulários, usuários e visualiza dados |
| **Usuário** | Idoso que responde os formulários |

> **Nota**: Administradores não precisam responder formulários. Apenas usuários comuns são contabilizados nas estatísticas de respondidos/faltantes.

## 📝 Tipos de Perguntas

- ⭐ **Estrelas**: Rating de 0 a 5 (com incrementos de 0.5)
- 😊 **Emoji**: Escala emocional (😠 😕 😐 🙂 😊)
- 🔢 **Numérica**: Escala de 0 a 10
- 📝 **Dissertativa**: Resposta aberta em texto
- ✅ **Múltipla Escolha**: Alternativas personalizadas

## 🚀 Roadmap

- [ ] Gráficos de evolução do usuário
- [ ] Lembretes para responder formulários
- [ ] Exportação de relatórios em PDF
- [ ] Modo offline para preenchimento
- [ ] Integração com wearables

## 📞 Contato

Desenvolvido com ❤️ para ajudar nossos idosos.

---

**Projeto Pi-6** - Sistema de Apoio ao Idoso
