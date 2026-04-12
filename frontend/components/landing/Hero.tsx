import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ArrowRight, Zap } from 'lucide-react'

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent/3 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-soft border border-accent/20 text-accent text-xs font-medium mb-8">
          <Zap className="w-3 h-3" />
          La plateforme tech freelance nouvelle génération
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05] mb-6">
          Les meilleurs{' '}
          <span className="relative">
            <span className="relative z-10 text-accent">talents tech</span>
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-accent/10 rounded-sm -z-0" />
          </span>
          {' '}à portée de main
        </h1>

        <p className="text-lg text-muted max-w-xl mx-auto mb-10 leading-relaxed">
          OPSIDE connecte les développeurs, designers et experts tech avec les entreprises qui cherchent les meilleurs profils. Simple, rapide, efficace.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/auth/register">
            <Button size="lg" className="w-full sm:w-auto">
              Rejoindre OPSIDE
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Se connecter
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['#7C3AED','#9333EA','#6D28D9','#4F46E5'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span>+500 candidats actifs</span>
          </div>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-border" />
          <span>+200 entreprises clientes</span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-border" />
          <span>Gratuit pour commencer</span>
        </div>
      </div>
    </section>
  )
}
