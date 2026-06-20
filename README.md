# Prof. Ebere Okorie — Academic & Research Website

A highly polished, professional full-stack academic website designed for **Prof. Ebere Okorie**, Professor of Sociology and Anthropology at the **University of Uyo, Nigeria**. 

This application features a rich scholarly interface for publications, ongoing/completed research projects, media gallery, academic blogs, and a robust back-office **Admin Dashboard** allowing real-time content management.

---

## 🌟 Key Features

1. **Academic Home & Biography**: A commanding scholarly landing page with quick professional statistics, profile portraits, core values, and downloadable curriculum vitae (CV) templates.
2. **Search-Fluent Bibliography**: A searchable, categorized database of published books, journal papers, and conference briefs complete with abstract expanders and citation-copy indicators.
3. **Research Specializations Portfolio**: Interactive sections breaking down core sociological disciplines (Gender, Families, Rural Smallholder Adaptations) and detailing project timelines/funding agents.
4. **Media Lightbox Gallery**: Elegant grid layouts organizing event photos (classroom lectures, rural fieldwork assemblies, award dinners) with modal lightboxes.
5. **Real-time Correspondence Form**: A contact portal writing submitted letters directly into the database.
6. **Scholarly News Feed**: Real-time blog reader view allowing viewers to check announcements, keynote summaries, and academic notes.
7. **Back-Office Admin Dashboard**:
   - Secure login portal with automatic sandbox simulation modes.
   - Complete CRUD (Add, Edit, Update, Delete) forms for Publications, Projects, Blogs/News, and Gallery images.
   - Real-time **Inquiries Inbox** to read, toggle mark-read, or delete incoming correspondence.
   - Interactive Analytics graphs calculating total material counts.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS v4 (designed with a custom navy-blue, white, and gold sovereign theme).
- **Icons**: Lucide Icons package.
- **Database & Auth**: Google Firebase (Firestore Database + Firebase Authentication).
- **Resilience Engine**: Custom multi-path data sync. If Firestore is disconnected or permissions are restricted, the site transparently falls back to synchronized local storage so the web application remains fully operational.

---

## 📂 Folder Structure

```text
/
├── assets/                    # Stationary assets
├── src/
│   ├── components/
│   │   └── Layout.tsx         # Global academic shell (Header, Navigation, Footer)
│   ├── data/
│   ├── pages/
│   │   ├── Home.tsx           # Scholarly introduction, recent work highlights
│   │   ├── About.tsx          # Complete biography & stylized print-ready CV
│   │   ├── PublicationsPage.tsx # Searchable list of journals & abstract collapsibles
│   │   ├── ResearchPage.tsx   # Specialization breakdowns & project grants
│   │   ├── GalleryPage.tsx    # Media grid & fullscreen lightbox modal
│   │   ├── BlogPage.tsx       # Dynamic blog feed & article reader injector
│   │   ├── ContactPage.tsx    # Inquiries form synced directly to the Firestore collection
│   │   └── AdminDashboard.tsx # Comprehensive back-office CMS & Inbox manager
│   ├── services/
│   │   └── db.ts              # Firebase service layer & local fallback synchronizer
│   ├── App.tsx                # Page state switches & startup database query loop
│   ├── firebase.ts            # Firebase SDK Initializer (Auth & Firestore)
│   ├── index.css              # Custom font interfaces and theme definitions
│   ├── main.tsx               # Primary mounting script
│   └── types.ts               # Shared database interfaces
├── index.html                 # Index layout shell
├── metadata.json              # Applet metadata configurations
├── package.json               # Package boundaries
├── tsconfig.json              # TypeScript compilation specifications
└── README.md                  # This documentation file
```

---

## 🔑 Admin Console Credentials

To access of the **Admin Portal** for testing/review, navigate to the **Consoles Portal** (top right of navigation or footer link) and enter:

- **Email**: `admin@okorie.edu.ng`
- **Password**: `Password123`

---

## 🚀 Local Run Instructions

To download and launch the development environment locally on your computer:

### 1. Prerequisite Installations
Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### 2. Install Project Dependencies
Run the install command inside the root folder to set up packages:
```bash
npm install
```

### 3. Start Development Server
Boot up the Vite build compiler locally:
```bash
npm run dev
```

### 4. Open in Browser
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌐 Production Deployment Guide

Since the application is fully designed as a Single Page Application (SPA), it compiles down into lightning-fast, high-performance static files (`html`, `css`, `js`) that deploy effortlessly on global CDNs.

### Build the Static Bundle
Run the build script to compile the site inside `/dist`:
```bash
npm run build
```

### 1. Deploy-Ready on Vercel (Recommended)
1. Sign in to your [Vercel Console](https://vercel.com).
2. Click **Add New Project** and connect your GitHub repository link.
3. Select the **Vite** framework preset.
4. Set the build parameters:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Vercel will host your academic portal in under 30 seconds!

### 2. Deploy-Ready on Netlify
1. Log in to [Netlify](https://www.netlify.com).
2. Select **Import from Git** or drag and drop your complied `dist/` directory directly into their web interface.
3. If importing via Git, configure the parameters:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Click **Deploy site**.
