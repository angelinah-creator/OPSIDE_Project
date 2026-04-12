export type UserRole = 'candidat' | 'client' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  status: UserStatus;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export type Availability = 'immediate' | 'one_week' | 'two_weeks' | 'one_month' | 'more';
export type Currency = 'EUR' | 'USD' | 'MGA';
export type CandidateStatus = 'open_to_work' | 'not_available' | 'in_mission';

export interface CandidateProfile {
  id: string;
  user_id: string;
  country: string;
  city?: string;
  speciality: string;
  experience_years: number;
  daily_rate: number;
  currency: Currency;
  availability: Availability;
  bio?: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  photo_url?: string;
  status: CandidateStatus;
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
}

export interface Experience {
  id: string;
  title: string;
  employment_type: string;
  company: string;
  start_month: number;
  start_year: number;
  end_month?: number;
  end_year?: number;
  is_current: boolean;
  location?: string;
  description?: string;
  skills: Skill[];
  medias?: Media[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field?: string;
  start_month: number;
  start_year: number;
  end_month?: number;
  end_year?: number;
  is_current: boolean;
  level: string;
  description?: string;
  skills: Skill[];
  medias?: Media[];
}

export interface Media {
  id: string;
  url: string;
  type: string;
  name?: string;
}

export type CompanySize = 'size_1_10' | 'size_11_50' | 'size_51_200' | 'size_201_500' | 'size_500_plus';

export interface ClientProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_size?: CompanySize;
  industry?: string;
  country: string;
  city?: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  interview_availability?: string;
  logo_url?: string;
}
