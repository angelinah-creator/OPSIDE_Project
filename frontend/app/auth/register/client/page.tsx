'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import FileUpload from '@/components/ui/FileUpload'
import { authApi } from '@/lib/auth-service'
import { clientApi } from '@/lib/client-service'
import { setTokens, setUser } from '@/lib/auth-service'
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check } from 'lucide-react'

const STEPS = ['Compte', 'Entreprise', 'Contact']

const SIZES = [
  { value: 'size_1_10', label: '1–10 employés' },
  { value: 'size_11_50', label: '11–50 employés' },
  { value: 'size_51_200', label: '51–200 employés' },
  { value: 'size_201_500', label: '201–500 employés' },
  { value: 'size_500_plus', label: '500+ employés' },
]

export default function ClientRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [showPw, setShowPw] = useState(false)

  const [account, setAccount] = useState({ first_name: '', last_name: '', email: '', password: '', confirm: '' })
  const [company, setCompany] = useState({ company_name: '', company_size: '', industry: '', country: '', city: '', website: '' })
  const [contact, setContact] = useState({ contact_name: '', contact_email: '', contact_phone: '', interview_availability: '' })

  const setA = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setAccount(p => ({ ...p, [k]: e.target.value }))
  const setC = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setCompany(p => ({ ...p, [k]: e.target.value }))
  const setCt = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setContact(p => ({ ...p, [k]: e.target.value }))

  const nextStep = async () => {
    setError('')
    if (step === 0) {
      if (account.password !== account.confirm) return setError('Les mots de passe ne correspondent pas.')
      if (account.password.length < 8) return setError('Mot de passe trop court (min. 8 caractères).')
    }
    setStep(s => s + 1)
  }

  const handleFinish = async () => {
    setError('')
    setLoading(true)
    try {
      // 1. Register
      const { data } = await authApi.register({
        email: account.email, password: account.password,
        role: 'client', first_name: account.first_name, last_name: account.last_name,
      })
      setTokens(data.access_token, data.refresh_token)
      setUser(data.user)

      // 2. Create profile
      await clientApi.createProfile({
        ...company, ...contact,
        contact_name: contact.contact_name || `${account.first_name} ${account.last_name}`,
        contact_email: contact.contact_email || account.email,
      })

      // 3. Upload logo if any
      if (logoFile) await clientApi.uploadLogo(logoFile).catch(() => {})

      router.push('/client/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.message
      if (err.response?.status === 409) setError('Cet email est déjà utilisé.')
      else setError(typeof msg === 'string' ? msg : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <Link href="/auth/register" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="bg-white rounded-3xl border border-border shadow-card p-8">
          <div className="flex justify-center mb-6"><Logo size={36} /></div>
          <h1 className="text-xl font-bold text-foreground text-center mb-1">Créer mon compte entreprise</h1>
          <p className="text-sm text-muted text-center mb-8">Trouvez les meilleurs talents tech</p>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                  i < step ? 'bg-accent text-white' :
                  i === step ? 'bg-foreground text-white' :
                  'bg-background border border-border text-muted'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`ml-1.5 text-xs font-medium hidden sm:block ${i === step ? 'text-foreground' : 'text-muted'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`w-8 sm:w-12 h-px mx-2 ${i < step ? 'bg-accent' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
          )}

          {/* Step 0 — Account */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Prénom" placeholder="Marie" value={account.first_name} onChange={setA('first_name')} required />
                <Input label="Nom" placeholder="Dupont" value={account.last_name} onChange={setA('last_name')} required />
              </div>
              <Input label="Email professionnel" type="email" placeholder="marie@entreprise.com" value={account.email} onChange={setA('email')} required />
              <div className="relative">
                <Input label="Mot de passe" type={showPw ? 'text' : 'password'} placeholder="Min. 8 caractères" value={account.password} onChange={setA('password')} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-8 text-muted hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Input label="Confirmer" type="password" placeholder="Répétez le mot de passe" value={account.confirm} onChange={setA('confirm')} required />
              <Button className="w-full mt-2" onClick={nextStep} disabled={!account.email || !account.password || !account.first_name}>
                Continuer <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 1 — Company */}
          {step === 1 && (
            <div className="space-y-4">
              <Input label="Nom de l'entreprise" placeholder="Tech Solutions SAS" value={company.company_name} onChange={setC('company_name')} required />
              <Select
                label="Taille de l'entreprise"
                options={SIZES}
                placeholder="Sélectionner..."
                value={company.company_size}
                onChange={setC('company_size')}
              />
              <Input label="Secteur d'activité" placeholder="Technologies de l'information" value={company.industry} onChange={setC('industry')} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Pays" placeholder="France" value={company.country} onChange={setC('country')} required />
                <Input label="Ville" placeholder="Paris" value={company.city} onChange={setC('city')} />
              </div>
              <Input label="Site web" type="url" placeholder="https://entreprise.com" value={company.website} onChange={setC('website')} />
              <FileUpload label="Logo de l'entreprise (optionnel)" accept="image/*" onUpload={async (f) => { setLogoFile(f); }} />
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(0)}>Retour</Button>
                <Button className="flex-1" onClick={nextStep} disabled={!company.company_name || !company.country}>
                  Continuer <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Contact */}
          {step === 2 && (
            <div className="space-y-4">
              <Input label="Nom du contact" placeholder={`${account.first_name} ${account.last_name}`} value={contact.contact_name} onChange={setCt('contact_name')} />
              <Input label="Email de contact" type="email" placeholder={account.email} value={contact.contact_email} onChange={setCt('contact_email')} />
              <Input label="Téléphone" placeholder="+33 6 12 34 56 78" value={contact.contact_phone} onChange={setCt('contact_phone')} />
              <Input label="Disponibilités pour les entretiens" placeholder="Lundi-Vendredi, 9h-18h" value={contact.interview_availability} onChange={setCt('interview_availability')} />
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Retour</Button>
                <Button className="flex-1" onClick={handleFinish} loading={loading}>
                  Créer mon compte <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-accent font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
