import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

const candidatSteps = [
  { n: '01', title: 'Créez votre compte', desc: 'Inscription en 2 minutes avec votre email.' },
  { n: '02', title: 'Complétez votre profil', desc: 'Ajoutez vos compétences, expériences et formations.' },
  { n: '03', title: 'Passez le test technique', desc: 'Validez vos compétences pour augmenter votre visibilité.' },
  { n: '04', title: 'Recevez des offres', desc: 'Les entreprises vous contactent directement.' },
]

const clientSteps = [
  { n: '01', title: 'Créez votre entreprise', desc: 'Inscription et profil entreprise en quelques minutes.' },
  { n: '02', title: 'Postez une offre', desc: 'Décrivez le poste, les compétences et le budget.' },
  { n: '03', title: 'Recevez des matchs', desc: 'Notre algorithme sélectionne les meilleurs profils.' },
  { n: '04', title: 'Recrutez', desc: 'Contactez les candidats et finalisez le recrutement.' },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-medium mb-3">Comment ça marche</p>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Simple comme bonjour
          </h2>
          <p className="text-muted max-w-lg mx-auto">
            Un processus clair et rapide pour les deux parties.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Candidat */}
          <div className="bg-white rounded-3xl p-8 border border-border shadow-card">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft border border-accent/20 text-accent text-xs font-medium mb-6">
              👤 Pour les candidats
            </div>
            <div className="space-y-6">
              {candidatSteps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-foreground text-white flex items-center justify-center text-xs font-bold">
                    {s.n}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">{s.title}</h4>
                    <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/auth/register?role=candidat">
                <Button className="w-full">
                  Je suis candidat <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Client */}
          <div className="bg-foreground rounded-3xl p-8 border border-foreground shadow-card">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium mb-6">
              🏢 Pour les entreprises
            </div>
            <div className="space-y-6">
              {clientSteps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center text-xs font-bold border border-white/20">
                    {s.n}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-1">{s.title}</h4>
                    <p className="text-xs text-white/60 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/auth/register?role=client">
                <Button variant="secondary" className="w-full">
                  Je suis une entreprise <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
