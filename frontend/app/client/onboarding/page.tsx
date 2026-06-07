'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import CountrySelect from '@/components/ui/CountrySelect'
import FileUpload from '@/components/ui/FileUpload'
import { clientApi } from '@/lib/client-service'
import { Check, ArrowRight } from 'lucide-react'

const STEPS = ['Entreprise', 'Contact']

const SIZES = [
  { value: 'size_1_10', label: '1–10 employés' },
  { value: 'size_11_50', label: '11–50 employés' },
  { value: 'size_51_200', label: '51–200 employés' },
  { value: 'size_200_plus', label: '200+ employés' },
]

const COUNTRIES = [
  { value: 'madagascar', label: 'Madagascar', flag: 'mg' },
  { value: 'senegal', label: 'Sénégal', flag: 'sn' },
  { value: 'maurice', label: 'Maurice', flag: 'mu' },
  { value: 'kenya', label: 'Kenya', flag: 'ke' },
  { value: 'nigeria', label: 'Nigeria', flag: 'ng' },
  { value: 'egypte', label: 'Égypte', flag: 'eg' },
  { value: 'maroc', label: 'Maroc', flag: 'ma' },
  { value: 'tunisie', label: 'Tunisie', flag: 'tn' },
]

// Client onboarding page
export default function ClientOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [company, setCompany] = useState({
    company_name: '',
    company_size: '',
    industry: '',
    country: '',
    city: '',
    website: ''
  })

  const [contact, setContact] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    interview_availability: ''
  })

  // Définit c
  const setC = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setCompany(p => ({ ...p, [k]: e.target.value }))

  // Définit ct
  const setCt = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContact(p => ({ ...p, [k]: e.target.value }))

  // Gère finish
  const handleFinish = async () => {
    setError('')
    setLoading(true)
    try {
      const profileData = {
        ...company, ...contact,
        contact_name: contact.contact_name || company.company_name,
        contact_email: contact.contact_email,
      }

      const cleanedData = Object.fromEntries(
        Object.entries(profileData).filter(([_, v]) => v !== '')
      )

      if (cleanedData.website && typeof cleanedData.website === 'string' && !/^https?:\/\//i.test(cleanedData.website)) {
        cleanedData.website = `https://${cleanedData.website}`;
      }

      await clientApi.createProfile(cleanedData)

      if (logoFile) await clientApi.uploadLogo(logoFile).catch(() => { })

      router.push('/client/dashboard')
    } catch (err: any) {
      console.error(err.response?.data);
      const msg = err.response?.data?.message
      if (Array.isArray(msg)) {
        setError(msg.join(', '))
      } else {
        setError(typeof msg === 'string' ? msg : 'Une erreur est survenue lors de la création du profil.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl border border-border shadow-card p-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.webp" alt="OPSIDE" className='w-28' />
          </div>

          <h1 className="text-xl font-bold text-foreground text-center mb-1">Configuration de votre profil entreprise</h1>
          <p className="text-sm text-muted text-center mb-8">Complétez ces informations pour commencer à recruter</p>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${i < step ? 'bg-accent text-white' :
                    i === step ? 'bg-foreground text-white' :
                      'bg-background border border-border text-muted'
                  }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`ml-1.5 text-xs font-medium hidden sm:block ${i === step ? 'text-foreground' : 'text-muted'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`w-12 h-px mx-2 ${i < step ? 'bg-accent' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
          )}

          {/* Step 0 — Company */}
          {step === 0 && (
            <div className="space-y-4">
              <Input label="Nom de l'entreprise *" placeholder="Tech Solutions SAS" value={company.company_name} onChange={setC('company_name')} required />
              <Select
                label="Taille de l'entreprise"
                options={SIZES}
                placeholder="Sélectionner..."
                value={company.company_size}
                onChange={setC('company_size')}
              />
              <Input label="Secteur d'activité" placeholder="Technologies de l'information" value={company.industry} onChange={setC('industry')} />
              <div className="grid grid-cols-2 gap-3">
                <CountrySelect
                  label="Pays *"
                  options={COUNTRIES}
                  placeholder="Choisir..."
                  value={company.country}
                  onChange={(v) => setCompany(p => ({ ...p, country: v }))}
                  error={!company.country && error ? 'Obligatoire' : undefined}
                />
                <Input label="Ville" placeholder="Paris" value={company.city} onChange={setC('city')} />
              </div>
              <Input label="Site web" type="url" placeholder="https://entreprise.com" value={company.website} onChange={setC('website')} />
              <FileUpload label="Logo de l'entreprise (optionnel)" accept="image/*" onUpload={async (f) => { setLogoFile(f); }} />

              <Button className="w-full mt-2" onClick={() => setStep(1)} disabled={!company.company_name || !company.country}>
                Continuer <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 1 — Contact */}
          {step === 1 && (
            <div className="space-y-4">
              <Input label="Nom du contact *" placeholder="Prénom Nom" value={contact.contact_name} onChange={setCt('contact_name')} required />
              <Input label="Email de contact *" type="email" placeholder="marie@entreprise.com" value={contact.contact_email} onChange={setCt('contact_email')} required />
              <Input label="Téléphone" placeholder="+33 6 12 34 56 78" value={contact.contact_phone} onChange={setCt('contact_phone')} />
              <Input label="Disponibilités pour les entretiens" placeholder="Lundi-Vendredi, 9h-18h" value={contact.interview_availability} onChange={setCt('interview_availability')} />

              <div className="flex gap-3 mt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(0)}>Retour</Button>
                <Button
                  className="flex-1"
                  onClick={handleFinish}
                  loading={loading}
                  disabled={!contact.contact_name || !contact.contact_email}
                >
                  Terminer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
