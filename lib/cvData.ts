// CV data from Firebase Firestore (collection `cv`), shared with the portfolio (dysrdh.github.io).
// Read-only over the public REST API — no SDK, no secrets. Edit the data in the Firebase Console.
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'portfolio-1f4eb'
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBSysQyC2EPhHQmN2OmLlYYoGspqNz06vs'

// Types matching the documents in Firestore
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

type Doc = { id: string; type?: string; sort_order?: number; [k: string]: any }

// Firestore REST returns typed values ({ stringValue: ... }); turn them back into plain JSON
function plain(v: any): any {
  if (!v) return null
  if ('stringValue' in v) return v.stringValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('booleanValue' in v) return v.booleanValue
  if ('timestampValue' in v) return v.timestampValue
  if ('nullValue' in v) return null
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(plain)
  if ('mapValue' in v) return fields(v.mapValue.fields)
  return null
}
function fields(f: Record<string, any> = {}) {
  const o: Record<string, any> = {}
  for (const k in f) o[k] = plain(f[k])
  return o
}

// Fetch all CV data
export async function fetchCVData() {
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cv?pageSize=100&key=${apiKey}`)
  if (!res.ok) throw new Error(`Firestore cv → ${res.status}`)
  const json = await res.json()
  const docs: Doc[] = (json.documents || []).map((d: any) => ({ id: d.name.split('/').pop(), ...fields(d.fields) }))
  const of = (type: string) => docs.filter(d => d.type === type).sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))

  return {
    profile: (docs.find(d => d.id === 'profile') as Profile | undefined) || null,
    education: of('education') as Education[],
    work: of('work') as WorkExperience[],
    org: of('org') as OrgExperience[],
    skills: of('skills') as Skill[],
  }
}
