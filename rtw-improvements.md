# Hierarquia de Componentes React

```
main.jsx
└── App.jsx (Router)
    ├── Login.jsx
    └── ProtectedRoute
        └── DashboardLayout
            ├── DashboardHeader
            ├── NotificationPanel
            └── Outlet (rotas autenticadas)
                ├── Home
                │   ├── EventModal
                │   ├── NovoEventoModal
                │   └── Cards (EventCard, ClassCard)
                ├── Eventos
                │   ├── EventCard
                │   └── NovoEventoModal
                ├── EventDetailsView
                │   ├── CriarGrupoPanel
                │   ├── EditEventPanel
                │   └── AddEventMemberPanel
                ├── Horario
                │   ├── Calendar (react-big-calendar)
                │   ├── ItemDetailModal
                │   ├── NovaDisponibilidadeModal
                │   └── NovoEventoModal
                ├── Aulas
                │   ├── NovaDisponibilidadeModal
                │   ├── NovaMarcacaoModal
                │   └── ItemDetailModal
                ├── Escola
                │   └── ActionCard
                ├── Modalidades
                │   └── NovaModalidadeModal
                ├── Profile
                │   └── EditarPerfilModal
                ├── PainelGestao
                │   └── ActionCard
                └── GestaoUtilizadores
                    └── NovoUtilizadorModal
```

---

## Componentes Duplicados

| Componente | Utilizado em | Nº de usos |
|---|---|:---:|
| `NovoEventoModal` | Home, Eventos, Horario | 3 |
| `ItemDetailModal` | Aulas, Horario | 2 |
| `NovaDisponibilidadeModal` | Aulas, Horario | 2 |
| `ActionCard` | Escola, PainelGestao | 2 |

---

## Melhorias Sugeridas

| # | Componente / Área | Problema | Sugestão |
|---|---|---|---|
| 1 | `NovoEventoModal` | Instanciado em 3 views diferentes | Elevar ao `DashboardLayout` ou gerir via contexto/portal |
| 2 | `ItemDetailModal` + `NovaDisponibilidadeModal` | Lógica duplicada entre Aulas e Horario | Extrair para um hook `useHorarioModals` partilhado |
| 3 | `roleRoute.jsx` | Existe mas não é usado no `App.jsx` | Integrar nas rotas de gestão ou remover |
| 4 | `HomeAdmin.jsx` | View separada mas não referenciada nas rotas | Ligar à rota `/` condicionalmente por role, ou remover |
| 5 | `EventCard` (Cards.jsx) | `Cards.jsx` exporta dois componentes num só ficheiro | Separar em `EventCard.jsx` e `ClassCard.jsx` |
| 6 | `EscolaModais.jsx` | Não aparece referenciado em nenhuma view identificada | Verificar se está ativo ou remover |
| 7 | Modais em `views/` | Modais de criação (`NovoX`) estão na pasta `views/` | Mover para `components/` — não são páginas, são UI |
| 8 | `DashboardLayout` | Polling de notificações hardcoded a 60 s | Tornar o intervalo configurável ou usar WebSocket |

---

## Classes CSS — Boas Práticas

### Tokens de cor semânticos

Substituir todas as cores hardcoded (`[#006A68]`, `[#4A6362]`, etc.) por tokens definidos no `tailwind.config.js`, nomeados pelo **papel na UI** e não pela intensidade:

```js
// tailwind.config.js
colors: {
  brand: {
    // Texto
    text:        '#161D1C',  // corpo principal
    heading:     '#324B4A',  // títulos
    secondary:   '#4A6362',  // texto secundário
    placeholder: '#6F7978',  // placeholders, desabilitado

    // Interativo
    primary:     '#006A68',  // botões, links, ícones ativos
    hover:       '#00504E',  // hover do primary

    // Fundos
    page:        '#F4FBF9',  // fundo da página
    surface:     '#EFF5F4',  // cards, painéis
    highlight:   '#CCE8E6',  // badges, fundos de ícones
    accent:      '#80D5D2',  // destaques visuais

    // Bordas
    border:      '#BEC9C7',  // divisores, bordas subtis
  }
}
```

**Migração:** find & replace nos ficheiros JSX/JS, por ordem de volume:

| Hex | Token |
|---|---|
| `[#006A68]` | `brand-primary` |
| `[#4A6362]` / `[#4a6362]` | `brand-secondary` |
| `[#CCE8E6]` | `brand-highlight` |
| `[#324B4A]` | `brand-heading` |
| `[#00504E]` | `brand-hover` |
| `[#EFF5F4]` | `brand-surface` |
| `[#F4FBF9]` | `brand-page` |
| `[#6F7978]` | `brand-placeholder` |
| `[#161D1C]` | `brand-text` |
| `[#BEC9C7]` | `brand-border` |
| `[#80D5D2]` | `brand-accent` |

As cores de estado (`[#93000A]`, `[#BA1A1A]`, etc.) podem ficar em hardcoded ou ser agrupadas num token `status-*` separado.

### CSS separado — quando usar

Não é necessário separar em ficheiros CSS. O Tailwind inline é o padrão e o Vite trata do purge. Usar `@layer components` no `index.css` só faz sentido para classes muito repetidas que não têm componente JSX próprio (ex: `.btn-primary`). Os componentes reutilizáveis (`StatusBadge`, `EventCard`, etc.) já resolvem o problema sem precisar de CSS separado.
