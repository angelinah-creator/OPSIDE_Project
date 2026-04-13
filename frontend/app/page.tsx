import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1A1A1A] leading-tight tracking-tight mb-6 ">
            L'infrastructure des {' '}
            <span className="bg-[#9333EA] bg-clip-text text-transparent">
              meilleurs talents
            </span>
            <br />pour l'Afrique.
          </h1>
          <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto mb-10 leading-relaxed">
            OPSIDE met en relation des développeurs technologiques africains qualifiés avec des entreprises internationales, grâce à un système automatisé de mise en relation, de contrats et de paie en monnaie locale. Une solution complète.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg">Rejoignez-nous en tant que développeur</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="black" size="lg">Recrutez avec OPSIDE</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#F0F0F0] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1A1A1A]">OPSIDE</span>
            <span className="text-[#AEAEAE] text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">Connexion</Link>
            <Link href="/auth/register" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
