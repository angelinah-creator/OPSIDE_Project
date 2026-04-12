import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            La plateforme freelance tech de référence
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1A1A1A] leading-tight tracking-tight mb-6">
            Trouvez les{' '}
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] bg-clip-text text-transparent">
              meilleurs talents
            </span>
            <br />tech en freelance
          </h1>
          <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto mb-10 leading-relaxed">
            OPSIDE connecte les développeurs freelance qualifiés avec les entreprises qui ont besoin d'expertise tech. Rapide, transparent, efficace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost" size="lg">Voir comment ça marche →</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-20 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '2 000+', label: 'Freelances actifs' },
            { value: '500+', label: 'Entreprises partenaires' },
            { value: '98%', label: 'Taux de satisfaction' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-[#1A1A1A]">{stat.value}</div>
              <div className="text-sm text-[#6B6B6B] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">Comment ça marche</h2>
            <p className="text-[#6B6B6B] max-w-xl mx-auto">En quelques étapes simples, démarrez votre aventure freelance ou trouvez votre prochain talent.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Candidat */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Pour les candidats</h3>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { step: '01', text: 'Créez votre compte et complétez votre profil' },
                  { step: '02', text: 'Ajoutez vos expériences et formations' },
                  { step: '03', text: 'Passez votre test technique' },
                  { step: '04', text: 'Recevez des offres adaptées à votre profil' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg mt-0.5">{item.step}</span>
                    <p className="text-sm text-[#4B4B4B]">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/auth/register/candidat">
                  <Button className="w-full">Je suis candidat</Button>
                </Link>
              </div>
            </div>

            {/* Client */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Pour les entreprises</h3>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { step: '01', text: 'Inscrivez votre entreprise en quelques minutes' },
                  { step: '02', text: 'Décrivez vos besoins et publiez une offre' },
                  { step: '03', text: 'Accédez aux profils de candidats qualifiés' },
                  { step: '04', text: 'Démarrez rapidement votre collaboration' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="text-xs font-bold text-[#6B6B6B] bg-[#EFEFEF] px-2 py-1 rounded-lg mt-0.5">{item.step}</span>
                    <p className="text-sm text-[#4B4B4B]">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/auth/register/client">
                  <Button variant="secondary" className="w-full">Je recrute</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">Pourquoi OPSIDE ?</h2>
            <p className="text-[#6B6B6B] max-w-xl mx-auto">Une plateforme pensée pour les professionnels du digital, avec des outils adaptés à leurs besoins.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Matching intelligent', desc: 'Notre algorithme vous connecte avec les profils les plus adaptés à vos besoins.' },
              { icon: '🛡️', title: 'Profils vérifiés', desc: 'Chaque candidat passe par un processus de vérification et un test technique.' },
              { icon: '💼', title: 'Diversité de profils', desc: 'Frontend, backend, fullstack, mobile, DevOps — tous les profils tech.' },
              { icon: '🌍', title: 'Talents mondiaux', desc: 'Accédez à des talents du monde entier, notamment de Madagascar.' },
              { icon: '📊', title: 'Suivi en temps réel', desc: 'Dashboard complet pour suivre vos candidatures et vos missions.' },
              { icon: '🔒', title: 'Paiements sécurisés', desc: 'Des transactions sécurisées et des contrats transparents.' },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-[#F0F0F0] hover:border-purple-200 hover:shadow-md transition-all">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-[#1A1A1A] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Prêt à commencer ?</h2>
          <p className="text-[#AEAEAE] mb-8">Rejoignez des milliers de professionnels qui font confiance à OPSIDE.</p>
          <Link href="/auth/register">
            <Button size="lg">Créer mon compte gratuitement</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#F0F0F0] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1A1A1A]">OPSIDE</span>
            <span className="text-[#AEAEAE] text-sm">© 2024</span>
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
