opside/
├── .env.local.example
├── README.md
├── proxy.ts                               # Protection des routes par rôle
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
│
├── app/
│   ├── globals.css
│   ├── layout.tsx                         # Layout racine + fonts
│   ├── page.tsx                           # Landing page
│   │
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx                   # Connexion
│   │   └── register/
│   │       ├── page.tsx                   # Choix du rôle
│   │       ├── candidat/
│   │       │   └── page.tsx               # Inscription candidat
│   │       └── client/
│   │           └── page.tsx               # Inscription client (3 étapes)
│   │
│   ├── candidat/
│   │   ├── onboarding/
│   │   │   └── page.tsx                   # Compléter profil (stepper 3 étapes)
│   │   ├── dashboard/
│   │   │   └── page.tsx                   # Dashboard "Test technique"
│   │   └── profile/
│   │       └── page.tsx                   # Modifier profil + exp + formations
│   │
│   ├── client/
│   │   ├── dashboard/
│   │   │   └── page.tsx                   # Dashboard "Poster offre"
│   │   └── profile/
│   │       └── page.tsx                   # Modifier profil client
│   │
│   └── admin/
│       ├── layout.tsx                     # Sidebar admin
│       ├── page.tsx                       # Dashboard stats
│       └── users/
│           └── page.tsx                   # Gestion utilisateurs
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Logo.tsx
│   │   ├── Badge.tsx
│   │   ├── FileUpload.tsx                 # Drag & drop + preview Cloudinary
│   │   └── SkillSelector.tsx             # Searchable multi-select avec catégories
│   │
│   ├── layout/
│   │   ├── Navbar.tsx                     # Navbar landing (sticky on scroll)
│   │   ├── AdminSidebar.tsx
│   │   ├── CandidatSidebar.tsx
│   │   └── ClientSidebar.tsx
│   │
│   └── landing/
│       ├── Hero.tsx
│       ├── Features.tsx
│       └── HowItWorks.tsx
│
├── lib/
│   ├── api.ts                             # Axios + tous les endpoints + refresh auto
│   └── auth.ts                            # Helpers cookies (get/set/clear tokens)
│
├── hooks/
│   ├── useAuth.ts
│   └── useProfile.ts
│
└── types/
    └── index.ts                           # Types TypeScript globaux