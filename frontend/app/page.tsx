import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/ui/FadeIn';
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
            <FadeIn delay={100}>
              <h1 className="text-5xl md:text-7xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-8 text-[#1A1A1A]">
                Recrutez les meilleurs<br />
                <span className="text-[#7f39ef]">développeurs africains</span><br />
                en 72h
              </h1>
            </FadeIn>

            {/* Subtitle */}
            <FadeIn delay={300}>
              <p className="text-md md:text-lg text-[#6B6B6B] max-w-2xl mx-auto mb-10 leading-relaxed">
                OPSIDE connecte les entreprises aux talents tech d'Afrique francophone. 
                Matching, tests techniques, contrats et paie — tout est géré.
              </p>
            </FadeIn>

            {/* Buttons */}
            <FadeIn delay={500}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="#cta">
                  <Button variant="gradient" size="lg" className="rounded-full px-10 flex gap-2 group hover:scale-105 hover:shadow-xl transition-all duration-300">
                    Demander une démo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" size="lg" className="rounded-full px-10 bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#1A1A1A] hover:scale-105 transition-all duration-300">
                    Voir les talents
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* --- LOGOS SECTION --- */}
        <section className="py-12 border-y border-[#F0F0F0]">
          <FadeIn delay={200} className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium text-[#AEAEAE] uppercase tracking-widest mb-10">Ils nous font confiance</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
              <span className="text-2xl font-bold italic tracking-tighter opacity-40 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer">TechCorp</span>
              <span className="text-2xl font-bold tracking-tight opacity-40 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer">InnovateLab</span>
              <span className="text-2xl font-black opacity-40 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer">DataFlow</span>
              <span className="text-2xl font-semibold tracking-wide opacity-40 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer">CloudSync</span>
              <span className="text-2xl font-mono opacity-40 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer">CodeBase</span>
            </div>
          </FadeIn>
        </section>

        {/* --- HOW IT WORKS SECTION --- */}
        <section id="how-it-works" className="py-24 md:py-32 bg-[#FAFAFA]">
          <FadeIn delay={100} className="max-w-4xl mx-auto px-4 text-center mb-10 md:mb-18">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-[#1A1A1A]">Comment ça marche</h2>
            <p className="text-[#6B6B6B] text-lg">Trois étapes simples pour constituer votre équipe tech en Afrique.</p>
          </FadeIn>

          <div className="max-w-5xl mx-auto px-4 flex flex-col gap-16 md:gap-24 relative mt-12">
            {/* Ligne de connexion verticale subtile */}
            <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-[#7C3AED]/20 to-transparent -translate-x-1/2" />

            {/* Step 1 */}
            <FadeIn delay={200} className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
              <div className="md:w-1/2 flex justify-center md:justify-end relative">
                <div className="relative flex items-center justify-center">
                  <span className="text-[10rem] md:text-[12rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-[#F5F5F5] to-[#EAEAEA] group-hover:from-[#F3EEFF] group-hover:to-[#E0D4FF] transition-all duration-700 select-none md:-mr-4">01</span>
                </div>
              </div>
              <div className="md:w-1/2 text-center md:text-left z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-[#F3EEFF] text-[#7C3AED] text-xs font-bold uppercase tracking-widest mb-4">Phase 1</div>
                <h3 className="text-3xl md:text-4xl font-black mb-4 text-[#1A1A1A]">Le Match Idéal</h3>
                <p className="text-[#6B6B6B] text-lg leading-relaxed">
                  Décrivez précisément votre besoin. Notre algorithme exclusif identifie instantanément les meilleurs profils en Afrique francophone, taillés pour votre culture d'entreprise.
                </p>
              </div>
            </FadeIn>

            {/* Step 2 */}
            <FadeIn delay={300} className="relative flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
              <div className="md:w-1/2 flex justify-center md:justify-start relative">
                <div className="relative flex items-center justify-center">
                  <span className="text-[10rem] md:text-[12rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-[#F5F5F5] to-[#EAEAEA] group-hover:from-[#F3EEFF] group-hover:to-[#E0D4FF] transition-all duration-700 select-none md:-ml-4">02</span>
                </div>
              </div>
              <div className="md:w-1/2 text-center md:text-right z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-[#F3EEFF] text-[#7C3AED] text-xs font-bold uppercase tracking-widest mb-4">Phase 2</div>
                <h3 className="text-3xl md:text-4xl font-black mb-4 text-[#1A1A1A]">Tests Techniques</h3>
                <p className="text-[#6B6B6B] text-lg leading-relaxed">
                  Finies les mauvaises surprises. Chaque candidat sélectionné passe un test technique de haut niveau, rigoureusement adapté à votre stack technologique.
                </p>
              </div>
            </FadeIn>

            {/* Step 3 */}
            <FadeIn delay={400} className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
              <div className="md:w-1/2 flex justify-center md:justify-end relative">
                <div className="relative flex items-center justify-center">
                  <span className="text-[10rem] md:text-[12rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-[#F5F5F5] to-[#EAEAEA] group-hover:from-[#F3EEFF] group-hover:to-[#E0D4FF] transition-all duration-700 select-none md:-mr-4">03</span>
                </div>
              </div>
              <div className="md:w-1/2 text-center md:text-left z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-bold uppercase tracking-widest mb-4">Phase 3</div>
                <h3 className="text-3xl md:text-4xl font-black mb-4 text-[#1A1A1A]">Intégration Express</h3>
                <p className="text-[#6B6B6B] text-lg leading-relaxed">
                  Votre nouveau développeur est prêt à coder en <span className="font-bold text-[#1A1A1A]">72h</span>. Concentrez-vous sur votre produit, nous gérons l'intégralité des contrats, de la paie et de la conformité légale.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section id="stats" className="py-14 md:py-22 bg-white">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            <FadeIn delay={100} className="text-center group cursor-default">
              <p className="text-3xl md:text-5xl font-black text-[#7f39ef] leading-none mb-4 inline-block group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">50+</p>
              <p className="text-[#6B6B6B] font-medium group-hover:text-[#1A1A1A] transition-colors duration-300">Développeurs vérifiés</p>
            </FadeIn>
            <FadeIn delay={300} className="text-center group cursor-default">
              <p className="text-3xl md:text-5xl font-black text-[#7f39ef] leading-none mb-4 inline-block group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">3</p>
              <p className="text-[#6B6B6B] font-medium group-hover:text-[#1A1A1A] transition-colors duration-300">Marchés africains</p>
            </FadeIn>
            <FadeIn delay={500} className="text-center group cursor-default">
              <p className="text-3xl md:text-5xl font-black text-[#7f39ef] leading-none mb-4 tracking-tighter inline-block group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">&lt;72h</p>
              <p className="text-[#6B6B6B] font-medium group-hover:text-[#1A1A1A] transition-colors duration-300">Temps de matching</p>
            </FadeIn>
            <FadeIn delay={700} className="text-center group cursor-default">
              <p className="text-3xl md:text-5xl font-black text-[#7f39ef] leading-none mb-4 inline-block group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">98%</p>
              <p className="text-[#6B6B6B] font-medium group-hover:text-[#1A1A1A] transition-colors duration-300">Taux de satisfaction</p>
            </FadeIn>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section id="cta" className="py-24 px-4">
          <FadeIn delay={200} className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-12 md:p-24 border border-[#F0F0F0] text-center shadow-elevated shadow-accent/25 relative overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-[#1A1A1A]">Prêt à scaler votre équipe ?</h2>
            <p className="text-[#6B6B6B] text-md md:text-lg mb-12 max-w-xl mx-auto">
              Rejoignez les entreprises qui construisent avec les meilleurs talents africains.
            </p>
            <Link href="#">
              <Button variant="gradient" size="lg" className="rounded-full px-12 group hover:scale-105 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                Demander une démo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
          </FadeIn>
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
