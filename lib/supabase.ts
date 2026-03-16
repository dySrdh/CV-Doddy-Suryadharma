import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript types matching DB schema
export interface Profile {
  id: string
  name: string
  phone: string
  email: string
  address: string
  linkedin: string
  portfolio: string
  summary: string
  photo_url?: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  gpa: string
  start_date: string
  end_date: string
  focus: string
  coursework: string[]
  sort_order: number
}

export interface WorkExperience {
  id: string
  company: string
  role: string
  start_date: string
  end_date: string
  description_items: string[]
  sort_order: number
}

export interface OrgExperience {
  id: string
  organization: string
  role: string
  start_date: string
  end_date: string
  description_items: string[]
  sort_order: number
}

export interface Skill {
  id: string
  category: string
  items: string[]
  sort_order: number
}

// Fetch all CV data
export async function fetchCVData() {
  const [
    { data: profile },
    { data: education },
    { data: work },
    { data: org },
    { data: skills },
  ] = await Promise.all([
    supabase.from('profile').select('*').single(),
    supabase.from('education').select('*').order('sort_order'),
    supabase.from('work_experience').select('*').order('sort_order'),
    supabase.from('organization_experience').select('*').order('sort_order'),
    supabase.from('skills').select('*').order('sort_order'),
  ])

  return { profile, education, work, org, skills }
}
