import { Search, ShieldCheck, Zap, BarChart3, Globe, Clock } from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Matching intelligent',
    desc: 'Notre algorithme connecte automatiquement les bons profils avec les bonnes opportunités selon les compétences et disponibilités.',
  },
  {
    icon: ShieldCheck,
    title: 'Profils vérifiés',
    desc: 'Chaque candidat complète un profil détaillé avec ses expériences, formations et compétences validées.',
  },
  {
    icon: Zap,
    title: 'Réponse rapide',
    desc: 'Obtenez des candidats qualifiés en moins de 48h. Fini les longues semaines de recherche.',
  },
  {
    icon: BarChart3,
    title: 'Suivi en temps réel',
    desc: 'Tableau de bord complet pour suivre vos candidatures, matchs et offres en cours.',
  },
  {
    icon: Globe,
    title: 'Talents du monde entier',
    desc: 'Accédez à un pool de talents internationaux, notamment les meilleurs experts tech de Madagascar.',
  },
  {
    icon: Clock,
    title: 'Disponibilité flexible',
    desc: 'Immédiat, sous une semaine, un mois — filtrez les candidats selon leur disponibilité réelle.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-medium mb-3">Fonctionnalités</p>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-muted max-w-lg mx-auto">
            Une plateforme pensée pour les deux côtés du marché — candidats et entreprises.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-border bg-background hover:bg-white hover:shadow-elevated hover:border-accent/20 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-200">
                  <Icon className="w-5 h-5 text-accent group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
