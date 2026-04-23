import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import { Search, ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <Navbar />

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative pt-28 pb-18 lg:pt-40 lg:pb-28 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 text-[#1A1A1A]">
              Recrutez les meilleurs<br />
              <span className="text-[#7f39ef]">développeurs africains</span><br />
              en 72h
            </h1>

            {/* Subtitle */}
            <p className="text-md md:text-lg text-[#6B6B6B] max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              OPSIDE connecte les entreprises aux talents tech d'Afrique francophone. 
              Matching, tests techniques, contrats et paie — tout est géré.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Link href="#cta">
                <Button variant="gradient" size="lg" className="rounded-full px-10 flex gap-2 group">
                  Demander une démo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="lg" className="rounded-full px-10 bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#1A1A1A]">
                  Voir les talents
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- LOGOS SECTION --- */}
        <section className="py-12 border-y border-[#F0F0F0]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium text-[#AEAEAE] uppercase tracking-widest mb-10">Ils nous font confiance</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale">
              <span className="text-2xl font-bold italic tracking-tighter">TechCorp</span>
              <span className="text-2xl font-bold tracking-tight">InnovateLab</span>
              <span className="text-2xl font-black">DataFlow</span>
              <span className="text-2xl font-semibold tracking-wide">CloudSync</span>
              <span className="text-2xl font-mono">CodeBase</span>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS SECTION --- */}
        <section id="how-it-works" className="py-24 md:py-32 bg-[#FAFAFA]">
          <div className="max-w-4xl mx-auto px-4 text-center mb-10 md:mb-18">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-[#1A1A1A]">Comment ça marche</h2>
            <p className="text-[#6B6B6B] text-lg">Trois étapes simples pour constituer votre équipe tech en Afrique.</p>
          </div>

          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Step 1 */}
            <div className="bg-white p-10 rounded-3xl border border-[#F0F0F0] hover:shadow-elevated transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#F3EEFF] flex items-center justify-center mb-8 group-hover:bg-[#7C3AED] transition-colors mx-auto">
                <Search className="w-6 h-6 text-[#7C3AED] group-hover:text-white transition-colors" />
              </div>
              <p className="text-[#7C3AED] text-sm font-bold uppercase tracking-widest mb-2">Etape 1</p>
              <h3 className="text-2xl font-bold mb-4 text-[#1A1A1A]">Match</h3>
              <p className="text-[#6B6B6B] leading-relaxed">
                Décrivez votre besoin. Notre algorithme identifie les meilleurs profils en Afrique francophone.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-10 rounded-3xl border border-[#F0F0F0] hover:shadow-elevated transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#F3EEFF] flex items-center justify-center mb-8 group-hover:bg-[#7C3AED] transition-colors mx-auto">
                <ShieldCheck className="w-6 h-6 text-[#7C3AED] group-hover:text-white transition-colors" />
              </div>
              <p className="text-[#7C3AED] text-sm font-bold uppercase tracking-widest mb-2">Etape 2</p>
              <h3 className="text-2xl font-bold mb-4 text-[#1A1A1A]">Test</h3>
              <p className="text-[#6B6B6B] leading-relaxed">
                Chaque candidat passe un test technique rigoureux adapté à votre stack.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-10 rounded-3xl border border-[#F0F0F0] hover:shadow-elevated transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#F3EEFF] flex items-center justify-center mb-8 group-hover:bg-[#7C3AED] transition-colors mx-auto">
                <CheckCircle className="w-6 h-6 text-[#7C3AED] group-hover:text-white transition-colors" />
              </div>
              <p className="text-[#7C3AED] text-sm font-bold uppercase tracking-widest mb-2">Etape 3</p>
              <h3 className="text-2xl font-bold mb-4 text-[#1A1A1A]">Hire</h3>
              <p className="text-[#6B6B6B] leading-relaxed">
                Intégrez votre développeur en 72h. Nous gérons contrats, paie et conformité.
              </p>
            </div>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section id="stats" className="py-14 md:py-22 bg-white">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            <div className="text-center">
              <p className="text-3xl md:text-5xl font-black text-[#7f39ef] leading-none mb-4">50+</p>
              <p className="text-[#6B6B6B] font-medium">Développeurs vérifiés</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-5xl font-black text-[#7f39ef] leading-none mb-4">3</p>
              <p className="text-[#6B6B6B] font-medium">Marchés africains</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-5xl font-black text-[#7f39ef] leading-none mb-4 tracking-tighter">&lt;72h</p>
              <p className="text-[#6B6B6B] font-medium">Temps de matching</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-5xl font-black text-[#7f39ef] leading-none mb-4">98%</p>
              <p className="text-[#6B6B6B] font-medium">Taux de satisfaction</p>
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section id="cta" className="py-24 px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-12 md:p-24 border border-[#F0F0F0] text-center shadow-elevated shadow-accent/25 relative overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-[#1A1A1A]">Prêt à scaler votre équipe ?</h2>
            <p className="text-[#6B6B6B] text-md md:text-lg mb-12 max-w-xl mx-auto">
              Rejoignez les entreprises qui construisent avec les meilleurs talents africains.
            </p>
            <Link href="#">
              <Button variant="gradient" size="lg" className="rounded-full px-12 group">
                Demander une démo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* --- FOOTER SECTION --- */}
      <footer className="border-t border-[#F0F0F0] py-12 md:py-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <img src="/logo.webp" alt="OPSIDE" className="w-24 grayscale brightness-0" />
          </div>
          <p className="text-sm text-[#AEAEAE]">© 2026 OPSIDE. Tous droits réservés.</p>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Mentions légales</Link>
            <Link href="#" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
