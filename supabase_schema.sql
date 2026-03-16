-- =============================================
-- CV Website - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Profile / Header Info
CREATE TABLE profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  linkedin TEXT,
  portfolio TEXT,
  summary TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Education
CREATE TABLE education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  gpa TEXT,
  start_date TEXT,
  end_date TEXT,
  focus TEXT,
  coursework TEXT[],
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work Experience
CREATE TABLE work_experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT 'Present',
  description_items TEXT[],
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Experience
CREATE TABLE organization_experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  description_items TEXT[],
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Technical Skills
CREATE TABLE skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  items TEXT[],
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - read public, write authenticated
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Public read education" ON education FOR SELECT USING (true);
CREATE POLICY "Public read work" ON work_experience FOR SELECT USING (true);
CREATE POLICY "Public read org" ON organization_experience FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);

-- Allow authenticated write (for admin updates)
CREATE POLICY "Auth write profile" ON profile FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write education" ON education FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write work" ON work_experience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write org" ON organization_experience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write skills" ON skills FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- SEED DATA - Doddy Suryadharma
-- =============================================

INSERT INTO profile (name, phone, email, address, linkedin, portfolio, summary) VALUES (
  'Doddy Suryadharma',
  '+62 81294453932',
  'Suryadharma.dy@gmail.com',
  'Jln .Aries Permai III, Blok C4 no 4 Jakarta Barat, 11620, Indonesia',
  'https://www.linkedin.com/in/doddy-suryadharma/',
  'https://suryadharma-dy-portfolio.vercel.app/',
  'Computer Science Graduate (S.Kom) from BINUS University with a robust focus on Full Stack and Mobile Development. Professionally experienced in delivering end-to-end digital solutions, ranging from cross-platform mobile applications using React Native to scalable web-based systems built with React JS, TypeScript, and PHP. Proven leadership as a Chairperson of a regional student organization, demonstrating excellence in project management, team coordination, and stakeholder engagement in fast-paced environments. A detail-oriented developer dedicated to writing clean, maintainable code and building user-centric applications that solve real-world problems.'
);

INSERT INTO education (institution, degree, gpa, start_date, end_date, focus, coursework, sort_order) VALUES (
  'BINUS University',
  'Bachelor of Computer Science',
  '3.56 / 4.00',
  'Sept 2022',
  'Feb 2026',
  'Full Stack Development, Mobile Programming, Software Engineering',
  ARRAY[
    'Web & Mobile Application Programming',
    'Software Engineering',
    'Object-Oriented Programming',
    'Algorithms & Programming',
    'Data Structures',
    'Computer Networks',
    'Artificial Intelligence'
  ],
  1
);

INSERT INTO work_experience (company, role, start_date, end_date, description_items, sort_order) VALUES (
  'PT Siaga Abdi Utama',
  'Mobile Programmer Intern',
  'February 2025',
  'Present',
  ARRAY[
    'Mobile Development: Developed Version 2 of an internal Mobile HRIS application to support employee attendance, overtime and leave requests, and upcoming task management, integrating GPS, camera, and local storage to enhance operational efficiency.',
    'Full-Stack Web: Developed responsive applications with Next.js, React, and PHP, ensuring seamless API and database integration.',
    'UI/UX Implementation: Converted complex Figma designs into pixel-perfect, functional code while maintaining cross-platform consistency.',
    'Optimization: Built dynamic, high-performance interfaces and multi-step forms to improve data flow and user efficiency.'
  ],
  1
);

INSERT INTO organization_experience (organization, role, start_date, end_date, description_items, sort_order) VALUES (
  'Binusian Gaming (Kemanggisan Region)',
  'Chairperson',
  'March 2024',
  'March 2025',
  ARRAY[
    'Led the regional student activity unit, overseeing strategic operations and organizational growth.',
    'Directed regional-scale esports tournaments, managing logistics, venue operations, and participant recruitment.',
    'Initiated discussions with external esports organizations to develop the competitive gaming ecosystem in Indonesia.'
  ],
  1
);

INSERT INTO skills (category, items, sort_order) VALUES
  ('Languages', ARRAY['PHP', 'TypeScript', 'JavaScript', 'Java', 'Python', 'C', 'HTML/CSS'], 1),
  ('Frameworks & Libraries', ARRAY['React.js', 'Next.js', 'React Native', 'CodeIgniter 4', 'Node.js'], 2),
  ('Tools & Databases', ARRAY['Git', 'MySQL', 'Supabase', 'Expo', 'Postman', 'Android Studio', 'Figma'], 3),
  ('Core Competencies', ARRAY['Full Stack Development', 'Mobile Development', 'RESTful API Integration', 'Data Structures & Algorithms'], 4);


-- =============================================
-- CARA UPLOAD FOTO KE SUPABASE STORAGE
-- =============================================
-- 1. Di Supabase dashboard → Storage → "New bucket"
--    Nama bucket: "avatars"  |  Public: ON
-- 2. Upload foto kamu (misal: doddy.jpg) ke bucket "avatars"
-- 3. Klik foto → "Get URL" → copy URL-nya
-- 4. Paste URL ke kolom photo_url di tabel profile:
--    UPDATE profile SET photo_url = 'https://xxxx.supabase.co/storage/v1/object/public/avatars/doddy.jpg'
--    WHERE name = 'Doddy Suryadharma';
