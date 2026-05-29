import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { useRef, useState } from 'react'
import { fetchCVData, Profile, Education, WorkExperience, OrgExperience, Skill } from '../lib/supabase'

interface Props {
  profile: Profile
  education: Education[]
  work: WorkExperience[]
  org: OrgExperience[]
  skills: Skill[]
}

// ─────────────────────────────────────────────────────────────────
// URL helpers — pastikan link selalu full URL (clickable di web,
// dan tetap terbaca di PDF karena html2pdf merender ke canvas).
// ─────────────────────────────────────────────────────────────────
function normalizeLinkedIn(value: string): { href: string; display: string } {
  const v = (value || '').trim()
  if (!v) return { href: '', display: '' }
  if (/^https?:\/\//i.test(v)) return { href: v, display: v.replace(/^https?:\/\//i, '') }
  const cleaned = v.replace(/^linkedin\.com\//i, '').replace(/^\/+/, '')
  const handle = cleaned.startsWith('in/') ? cleaned : `in/${cleaned}`
  const display = `linkedin.com/${handle}`
  return { href: `https://${display}`, display }
}

function normalizeUrl(value: string): { href: string; display: string } {
  const v = (value || '').trim()
  if (!v) return { href: '', display: '' }
  if (/^https?:\/\//i.test(v)) return { href: v, display: v.replace(/^https?:\/\//i, '') }
  return { href: `https://${v}`, display: v }
}

function telHref(phone: string): string {
  return `tel:${(phone || '').replace(/[^\d+]/g, '')}`
}

export default function CVPage({ profile, education, work, org, skills }: Props) {
  const cvRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    if (!cvRef.current) return
    setDownloading(true)

    try {
      if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
        await (document as any).fonts.ready
      }

      const html2pdf = (await import('html2pdf.js')).default
      const element = cvRef.current

      const opt = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        filename: `${profile.name.replace(/ /g, '_')}_CV.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
          logging: false,
          windowWidth: element.scrollWidth,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }

      await html2pdf().set(opt).from(element).save()
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF gagal dibuat. Coba lagi.')
    }

    setDownloading(false)
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'DS'

  const linkedin = normalizeLinkedIn(profile?.linkedin || '')
  const portfolio = normalizeUrl(profile?.portfolio || '')

  return (
    <>
      <Head>
        <title>{profile.name} — CV</title>
        <meta name="description" content={profile.summary?.slice(0, 160) || ''} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
      </Head>

      {/* ── TOP BAR ── */}
      <nav className="no-print topbar">
        <div className="topbar__inner">
          <span className="topbar__name">{profile.name}</span>
          <button className="btn-dl" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Generating...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ── PAGE WRAPPER ── */}
      <div className="outer">
        <div className="cv" ref={cvRef}>

          {/* ── HEADER ── */}
          <header className="hdr">
            <div className="hdr__main">
              <h1 className="hdr__name">{profile.name}</h1>
              <div className="hdr__accent" />

              <div className="hdr__contacts">
                {profile.phone && (
                  <a className="ci" href={telHref(profile.phone)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.07 6.07l1.17-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    <span>{profile.phone}</span>
                  </a>
                )}
                {profile.email && (
                  <a className="ci" href={`mailto:${profile.email}`}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></svg>
                    <span>{profile.email}</span>
                  </a>
                )}
                {profile.address && (
                  <span className="ci">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <span>{profile.address}</span>
                  </span>
                )}
                {linkedin.href && (
                  <a className="ci ci-block" href={linkedin.href} target="_blank" rel="noopener noreferrer">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                    <span>{linkedin.display}</span>
                  </a>
                )}
                {portfolio.href && (
                  <a className="ci ci-block" href={portfolio.href} target="_blank" rel="noopener noreferrer">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                    <span>{portfolio.display}</span>
                  </a>
                )}
              </div>
            </div>
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="hdr__photo"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="hdr__photo hdr__photo--init">{initials}</div>
            )}
          </header>

          {/* ── ABOUT ME ── */}
          {profile.summary && (
            <section className="sec">
              <h2 className="sec__title">Profile</h2>
              <p className="summary_text">{profile.summary}</p>
            </section>
          )}

          {/* ── EDUCATION ── */}
          {education && education.length > 0 && (
            <section className="sec">
              <h2 className="sec__title">Education</h2>
              {education.map((edu) => (
                <div key={edu.id} className="entry">
                  <div className="entry__header">
                    <span className="entry__title">{edu.institution}</span>
                    <span className="entry__date">{edu.start_date} – {edu.end_date}</span>
                  </div>
                  <div className="entry__sub">{edu.degree}{edu.gpa && ` · GPA: ${edu.gpa}`}</div>
                  {edu.focus && <p className="entry__focus"><span className="entry__focus-label">Focus:</span> {edu.focus}</p>}
                  {edu.coursework && edu.coursework.length > 0 && (
                    <ul className="entry__list">
                      {edu.coursework.map((c, i) => (
                        <li key={i}><span className="bullet" /><span>{c}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* ── WORK EXPERIENCE ── */}
          {work && work.length > 0 && (
            <section className="sec">
              <h2 className="sec__title">Work Experience</h2>
              {work.map((job) => (
                <div key={job.id} className="entry">
                  <div className="entry__header">
                    <span className="entry__title">{job.company}</span>
                    <span className="entry__date">{job.start_date} – {job.end_date}</span>
                  </div>
                  <div className="entry__sub">{job.role}</div>
                  {job.description_items && job.description_items.length > 0 && (
                    <ul className="entry__list">
                      {job.description_items.map((item, i) => (
                        <li key={i}><span className="bullet" /><span>{item}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* ── ORGANIZATION ── */}
          {org && org.length > 0 && (
            <section className="sec">
              <h2 className="sec__title">Organization Experience</h2>
              {org.map((o) => (
                <div key={o.id} className="entry">
                  <div className="entry__header">
                    <span className="entry__title">{o.organization}</span>
                    <span className="entry__date">{o.start_date} – {o.end_date}</span>
                  </div>
                  <div className="entry__sub">{o.role}</div>
                  {o.description_items && o.description_items.length > 0 && (
                    <ul className="entry__list">
                      {o.description_items.map((item, i) => (
                        <li key={i}><span className="bullet" /><span>{item}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* ── SKILLS ── */}
          {skills && skills.length > 0 && (
            <section className="sec">
              <h2 className="sec__title">Skills &amp; Expertise</h2>
              <div className="skills_container">
                {skills.map((sg) => (
                  <div key={sg.id} className="skill_row">
                    <span className="skill_label">{sg.category}</span>
                    <div className="skill_chips">
                      {sg.items.map((it, i) => (
                        <span key={i} className="skill_chip">{it}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --black: #0b1220;
          --dark: #111827;
          --mid: #374151;
          --muted: #6b7280;
          --soft: #9ca3af;
          --accent: #1e3a8a;
          --accent-soft: #eef2ff;
          --border: #e5e7eb;
          --line: #d1d5db;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --font-serif: 'Lora', Georgia, serif;
        }

        html { font-size: 16px; }
        body {
          background: #eef2f7;
          color: var(--mid);
          font-family: var(--font-serif);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ── Topbar ── */
        .topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: saturate(180%) blur(8px);
          -webkit-backdrop-filter: saturate(180%) blur(8px);
          border-bottom: 1px solid var(--border);
          padding: 10px 0;
        }
        .topbar__inner {
          max-width: 900px; margin: 0 auto;
          padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .topbar__name {
          font-family: var(--font-sans);
          font-size: 14px; font-weight: 700;
          color: var(--dark); letter-spacing: 0.01em;
        }
        .btn-dl {
          background: var(--accent); color: white;
          border: none; border-radius: 8px;
          padding: 9px 18px;
          font-family: var(--font-sans); font-size: 13px; font-weight: 700;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(30,58,138,0.2);
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
        }
        .btn-dl:hover {
          background: #1e40af;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(30,58,138,0.25);
        }
        .btn-dl:disabled { background: #93c5fd; cursor: not-allowed; transform: none; box-shadow: none; }

        /* ── Outer ── */
        .outer {
          padding: 76px 20px 60px;
          display: flex; justify-content: center;
        }

        /* ── CV document — fixed A4 width ── */
        .cv {
          background: white;
          width: 210mm;
          min-height: 297mm;
          padding: 16mm 18mm;
          box-shadow: 0 10px 40px rgba(15, 23, 42, 0.12);
          border-radius: 2px;
        }

        /* ── Header ── */
        .hdr {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 22px;
          padding-bottom: 14px;
          margin-bottom: 18px;
          border-bottom: 2px solid var(--black);
        }
        .hdr__main { flex: 1; min-width: 0; }
        .hdr__name {
          font-family: var(--font-sans);
          font-size: 30pt; font-weight: 800;
          color: var(--black);
          letter-spacing: -0.025em;
          line-height: 1.0;
        }
        .hdr__accent {
          width: 52px;
          height: 3px;
          background: var(--accent);
          margin: 9px 0 11px;
          border-radius: 2px;
        }
        .hdr__contacts {
          display: flex;
          flex-wrap: wrap;
          gap: 5px 0;
          font-family: var(--font-sans);
          font-size: 8.7pt;
          color: var(--mid);
        }
        .ci {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          color: var(--mid);
          text-decoration: none;
        }
        a.ci:hover { color: var(--accent); }
        a.ci:hover svg { color: var(--accent); }
        /* separator dot between inline items */
        .ci:not(.ci-block):not(:last-of-type)::after {
          content: "•";
          margin: 0 9px;
          color: var(--soft);
          font-size: 8pt;
        }
        /* address / linkedin / portfolio = full row */
        .ci-block {
          display: flex;
          flex-basis: 100%;
          white-space: normal;
          word-break: break-all;
          gap: 6px;
          margin-top: 2px;
        }
        .ci svg { flex-shrink: 0; color: var(--accent); transition: color 0.15s; }

        /* ── Photo ── */
        .hdr__photo {
          width: 92px;
          height: 92px;
          min-width: 92px;
          min-height: 92px;
          max-width: 92px;
          max-height: 92px;
          border-radius: 8px;
          object-fit: cover;
          object-position: center top;
          flex-shrink: 0;
          flex-grow: 0;
          border: 2px solid white;
          box-shadow: 0 0 0 1px var(--border), 0 2px 6px rgba(0,0,0,0.06);
          display: block;
        }
        .hdr__photo--init {
          width: 92px;
          height: 92px;
          min-width: 92px;
          min-height: 92px;
          border-radius: 8px;
          background: var(--accent); color: white;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-sans);
          font-size: 26pt; font-weight: 800;
          flex-shrink: 0;
          flex-grow: 0;
        }

        /* ── Section ── */
        .sec { margin-bottom: 16px; }
        .sec:last-child { margin-bottom: 0; }

        .sec__title {
          font-family: var(--font-sans);
          font-size: 9.5pt; font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--accent);
          padding-bottom: 5px;
          margin-bottom: 11px;
          position: relative;
          border-bottom: 1px solid var(--border);
        }
        .sec__title::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 38px;
          height: 2px;
          background: var(--accent);
          border-radius: 2px;
        }

        /* ── Summary ── */
        .summary_text {
          font-size: 9.8pt;
          line-height: 1.65;
          text-align: justify;
          color: var(--mid);
        }

        /* ── Entry ── */
        .entry { margin-bottom: 12px; }
        .entry:last-child { margin-bottom: 0; }

        .entry__header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
        }
        .entry__title {
          font-family: var(--font-sans);
          font-size: 10.5pt; font-weight: 700;
          color: var(--black);
          letter-spacing: -0.005em;
        }
        .entry__date {
          font-family: var(--font-sans);
          font-size: 8.5pt; font-weight: 600;
          color: var(--accent);
          background: var(--accent-soft);
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.01em;
        }
        .entry__sub {
          font-family: var(--font-serif);
          font-size: 9.8pt; font-weight: 500;
          font-style: italic;
          color: var(--mid);
          margin-top: 3px; margin-bottom: 4px;
        }
        .entry__focus {
          font-size: 9.3pt;
          color: var(--mid);
          margin-bottom: 4px;
          line-height: 1.5;
        }
        .entry__focus-label {
          font-family: var(--font-sans);
          font-weight: 600;
          color: var(--dark);
        }
        .entry__list {
          list-style: none;
          padding-left: 0;
          margin-top: 4px;
        }
        .entry__list li {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          font-size: 9.6pt;
          color: var(--mid);
          margin-bottom: 3px;
          line-height: 1.55;
        }
        .entry__list li .bullet {
          flex-shrink: 0;
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent);
          margin-top: 7px;
          margin-left: 4px;
          margin-right: 3px;
        }

        /* ── Skills ── */
        .skills_container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .skill_row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 12px;
          align-items: start;
        }
        .skill_label {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 9.5pt;
          color: var(--dark);
          padding-top: 3px;
        }
        .skill_chips {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 6px;
        }
        .skill_chip {
          display: inline-block;
          font-family: var(--font-sans);
          font-size: 8.7pt;
          font-weight: 500;
          color: var(--dark);
          background: #f3f4f6;
          border: 1px solid var(--border);
          padding: 2px 9px;
          border-radius: 999px;
          line-height: 1.4;
        }

        /* ── Print / PDF ── */
        @media print {
          @page { size: A4; margin: 0; }
          .no-print { display: none !important; }
          .outer { padding: 0; background: white; }
          .cv { box-shadow: none; width: 100%; min-height: unset; padding: 14mm 16mm; border-radius: 0; }
          body { background: white; }
          a { color: inherit; text-decoration: none; }
        }

        @media (max-width: 680px) {
          .cv { width: 100%; padding: 24px 18px; min-height: unset; }
          .hdr { flex-direction: column-reverse; align-items: flex-start; }
          .hdr__photo, .hdr__photo--init { width: 76px; height: 76px; min-width: 76px; min-height: 76px; }
          .hdr__name { font-size: 22pt; }
          .skill_row { grid-template-columns: 1fr; gap: 4px; }
          .skill_label { padding-top: 0; }
          .entry__header { flex-direction: column; align-items: flex-start; gap: 3px; }
        }
      `}</style>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await fetchCVData()
  return {
    props: {
      profile: data.profile || null,
      education: data.education || [],
      work: data.work || [],
      org: data.org || [],
      skills: data.skills || [],
    },
  }
}
