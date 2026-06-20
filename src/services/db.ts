import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Publication, BlogPost, Project, GalleryImage, ContactMessage } from '../types';

// ==========================================
// DEFAULT / SEED DATA
// ==========================================

const DEFAULT_PUBLICATIONS: Publication[] = [
  {
    id: 'pub1',
    title: 'School Delinquency, Institutional Control, and Academic Performance of Secondary School Students in Uyo, Akwa Ibom State',
    authors: 'Ebere J. Okorie',
    type: 'journal',
    publisher: 'International Journal of Social Sciences and Humanities Invention',
    year: 2021,
    link: 'http://www.ijsi.org.ng/index.php/ijsi/article/view/100',
    description: 'This study investigates the complex linkages between juvenile delinquency and academic outcomes in secondary institutions inside Uyo metropolis, analyzing modern structural solutions for family therapy and school adjustments.',
    dateAdded: '2026-01-15'
  },
  {
    id: 'pub2',
    title: 'Criminology & Deviant Behavior: Foundations of Crime Management in Nigeria',
    authors: 'Ebere James Okorie',
    type: 'book',
    publisher: 'University of Uyo Press',
    year: 2023,
    link: '',
    description: 'A comprehensive academic textbook detailing theoretical frameworks on urban misconduct, cyber-deviancy, community systems, and local security policies in Nigeria for senior researchers and graduates.',
    dateAdded: '2026-02-10'
  },
  {
    id: 'pub3',
    title: 'The Police, Public Relations, and Crime Control in Akwa Ibom State: An Empirical Appraisal',
    authors: 'Ebere James Okorie',
    type: 'journal',
    publisher: 'Journal of West African Criminology and Security Studies',
    year: 2022,
    link: '',
    description: 'An empirical appraisal of neighborhood security frameworks and public-relations patterns used by the Nigerian Police Force to facilitate grassroots information sharing and local policing in modern South-Southern Nigeria.',
    dateAdded: '2026-03-05'
  },
  {
    id: 'pub4',
    title: 'Socio-Demographic Factors and Criminal Deviance among Juvenile Inmates in Custodial and Correctional Centers in Akwa Ibom State',
    authors: 'Ebere J. Okorie & Udeme Ikpo',
    type: 'journal',
    publisher: 'African Journal of Criminological Studies',
    year: 2020,
    link: '',
    description: 'Analyzes demographic traits of juvenile offenders housed in safety centers and correctional shelters in Akwa Ibom State, mapping delinquency trends back to localized social dislocations.',
    dateAdded: '2026-04-12'
  }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj1',
    title: 'An Empirical Evaluation of Community Policing and Security Frameworks in Akwa Ibom Rural-Urban Frontiers',
    status: 'ongoing',
    role: 'Principal Investigator',
    description: 'An active academic research effort outlining cooperation protocols between administrative safety groups and local youth collectives to promote community surveillance and counter property offenses.',
    timeline: '2024 - Present',
    funding: 'TetFund (Tertiary Education Trust Fund) National Research Grant'
  },
  {
    id: 'proj2',
    title: 'Institutional Responses to Cyber-Crime and Fraud-Based Deviation among Tertiary School Students in South-Southern Nigeria',
    status: 'completed',
    role: 'Lead Researcher',
    description: 'An inter-university study mapping the impact of modern digital networks and student economic pressures on cyber-delinquency rates, generating digital integrity blueprints for campus policy.',
    timeline: '2021 - 2023',
    funding: 'University of Uyo Annual Senate Research Grant'
  },
  {
    id: 'proj3',
    title: 'De-radicalization and Rehabilitation Models for Juvenile Offenders in Akwa Ibom Custodial Centers',
    status: 'completed',
    role: 'Consultant Criminologist',
    description: 'An evaluation of cognitive-behavioral training strategies inside corrective youth shelters, designing educational tools to deter post-release delinquency recidivism.',
    timeline: '2019 - 2021',
    funding: 'National Restorations Initiative Support Grant'
  }
];

const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog1',
    title: 'Prof. Ebere James Okorie Addresses Restorative Justice Reforms at Pan-African Criminology Conference',
    content: 'Prof. Ebere James Okorie of the Department of Sociology and Anthropology, University of Uyo, recently delivered a keynote keynote address at the African Faculty of Social Sciences assembly. He advocated for systemic transitions in juvenile custodial cells, emphasizing restorative training models over punitive isolation. "Our correctional administration must replace rigid confinement list positive re-education modules to secure Akwa Ibom youth," he declared, following his advisory appointment for South-South Custodial Support Advisory.',
    excerpt: 'Prof. Ebere James Okorie calls for cognitive-educational rehabilitation structures for juvenile corrections at the regional meeting.',
    date: '2026-05-15',
    category: 'Announcements',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600'
  },
  {
    id: 'blog2',
    title: 'Notes from the Field: Evaluating Rehabilitative Dynamics and Youth Delinquency',
    content: 'Criminology is most effective when engaging with people in active correctional environments. In our latest field research project, our doctoral and master level scholars visited remand homes in Akwa Ibom State to evaluate correctional and de-radicalization templates. The feedback highlights how vocational coaching and family counseling operate as active deterrents against youth deviance, validating traditional control theory.',
    excerpt: 'Faculty criminology candidates complete empirical evaluations inside safety shelters, testing theoretical frameworks of delinquency.',
    date: '2026-06-02',
    category: 'Academic Notes',
    imageUrl: 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=600'
  },
  {
    id: 'blog3',
    title: 'Keynote Lecture: Community-Police Alliances and Crime Prevention in South-Southern Nigeria',
    content: 'At the annualSocial Sciences Symposium, Prof. Ebere Okorie outlined the strategic value of community policing models. He remarked that local security can only exist when residents and surveillance departments establish robust networks built on joint consultations, intelligence channels, and reciprocal local safety campaigns.',
    excerpt: 'A summary of Prof. Okorie\'s recent address emphasizing modern neighborhood cooperation models over reactive punishment.',
    date: '2026-06-12',
    category: 'Conferences',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600'
  }
];

const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'gal1',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600',
    caption: 'Presenting a keynote lecture on Criminological Theories and National Security at the Social Sciences Annual Seminar.',
    date: '2025-11-20',
    category: 'Lectures'
  },
  {
    id: 'gal2',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600',
    caption: 'Fostering intellectual analysis during an advanced seminar with postgraduate doctoral criminologist candidates.',
    date: '2026-03-10',
    category: 'Lectures'
  },
  {
    id: 'gal3',
    imageUrl: 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=600',
    caption: 'Conducting community meetings and interviewing security officers on regional community-policing setups.',
    date: '2025-08-14',
    category: 'Fieldwork'
  },
  {
    id: 'gal4',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600',
    caption: 'Being honored with the Academic Merit Award at the Nigerian Criminological and Anthropological Association conference.',
    date: '2026-02-18',
    category: 'Conferences'
  }
];

// Seed initial values in localStorage as our reliable local fallback
const initLocalData = () => {
  const currentPubs = localStorage.getItem('okorie_publications');
  if (!currentPubs || currentPubs.includes("Intersection of Gender") || currentPubs.includes("Sociology of the Nigerian Family")) {
    localStorage.setItem('okorie_publications', JSON.stringify(DEFAULT_PUBLICATIONS));
  }
  const currentProjs = localStorage.getItem('okorie_projects');
  if (!currentProjs || currentProjs.includes("Climate Adaptations") || currentProjs.includes("Indigenous Land inheritance")) {
    localStorage.setItem('okorie_projects', JSON.stringify(DEFAULT_PROJECTS));
  }
  const currentBlog = localStorage.getItem('okorie_blog');
  if (!currentBlog || currentBlog.includes("Gender Equity Council") || currentBlog.includes("Ibibio Traditional Council")) {
    localStorage.setItem('okorie_blog', JSON.stringify(DEFAULT_BLOG_POSTS));
  }
  const currentGal = localStorage.getItem('okorie_gallery');
  if (!currentGal || currentGal.includes("Sociology of Development") || currentGal.includes("Ibibio traditions") || currentGal.includes("Esusu")) {
    localStorage.setItem('okorie_gallery', JSON.stringify(DEFAULT_GALLERY_IMAGES));
  }
  if (!localStorage.getItem('okorie_messages')) {
    localStorage.setItem('okorie_messages', JSON.stringify([]));
  }
};

initLocalData();

// ==========================================
// FIRESTORE SYNCING & FAILING GRACEFULLY
// ==========================================

export const fetchPublications = async (): Promise<Publication[]> => {
  try {
    const q = query(collection(db, 'publications'), orderBy('year', 'desc'));
    const snapshot = await getDocs(q);
    const hasOldData = snapshot.docs.some(doc => {
      const title = doc.data().title || "";
      return title.includes("Intersection of Gender") || title.includes("Sociology of the Nigerian Family") || title.includes("Conflict Resolution among the Ibibio");
    });
    if (snapshot.empty || hasOldData) {
      if (hasOldData) {
        console.log("Upgrading outdated publications schema in Firestore...");
        await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, 'publications', d.id))));
      }
      const seedPromises = DEFAULT_PUBLICATIONS.map(pub => {
        const { id, ...rest } = pub;
        return addDoc(collection(db, 'publications'), rest);
      });
      await Promise.all(seedPromises);
      localStorage.setItem('okorie_publications', JSON.stringify(DEFAULT_PUBLICATIONS));
      return DEFAULT_PUBLICATIONS;
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Publication));
  } catch (error) {
    console.warn("Firestore fetchPublications failed, falling back to local storage:", error);
    return JSON.parse(localStorage.getItem('okorie_publications') || '[]');
  }
};

export const addPublication = async (pub: Omit<Publication, 'id'>): Promise<Publication> => {
  try {
    const docRef = await addDoc(collection(db, 'publications'), pub);
    const newPub = { id: docRef.id, ...pub };
    
    // Sync with local
    const local = JSON.parse(localStorage.getItem('okorie_publications') || '[]');
    localStorage.setItem('okorie_publications', JSON.stringify([newPub, ...local]));
    
    return newPub;
  } catch (error) {
    console.warn("Firestore addPublication failed, performing local operation:", error);
    const local = JSON.parse(localStorage.getItem('okorie_publications') || '[]');
    const newPub = { id: 'local_' + Date.now(), ...pub };
    localStorage.setItem('okorie_publications', JSON.stringify([newPub, ...local]));
    return newPub;
  }
};

export const updatePublication = async (pub: Publication): Promise<void> => {
  try {
    const { id, ...rest } = pub;
    if (id.startsWith('local_')) {
      throw new Error("Local item cannot be updated in Firestore directly");
    }
    const docRef = doc(db, 'publications', id);
    await updateDoc(docRef, { ...rest });
    
    // Sync with local
    const local: Publication[] = JSON.parse(localStorage.getItem('okorie_publications') || '[]');
    const updated = local.map(p => p.id === id ? pub : p);
    localStorage.setItem('okorie_publications', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore updatePublication failed, performing local operation:", error);
    const local: Publication[] = JSON.parse(localStorage.getItem('okorie_publications') || '[]');
    const updated = local.map(p => p.id === pub.id ? pub : p);
    localStorage.setItem('okorie_publications', JSON.stringify(updated));
  }
};

export const deletePublication = async (id: string): Promise<void> => {
  try {
    if (id.startsWith('local_')) {
      throw new Error("Local item cannot be deleted from Firestore");
    }
    const docRef = doc(db, 'publications', id);
    await deleteDoc(docRef);
    
    // Sync with local
    const local: Publication[] = JSON.parse(localStorage.getItem('okorie_publications') || '[]');
    const updated = local.filter(p => p.id !== id);
    localStorage.setItem('okorie_publications', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore deletePublication failed, performing local operation:", error);
    const local: Publication[] = JSON.parse(localStorage.getItem('okorie_publications') || '[]');
    const updated = local.filter(p => p.id !== id);
    localStorage.setItem('okorie_publications', JSON.stringify(updated));
  }
};

// ==========================================
// PROJECTS OPERATIONS
// ==========================================

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const q = collection(db, 'projects');
    const snapshot = await getDocs(q);
    const hasOldData = snapshot.docs.some(doc => {
      const title = doc.data().title || "";
      return title.includes("Climate Adaptations") || title.includes("Indigenous Land");
    });
    if (snapshot.empty || hasOldData) {
      if (hasOldData) {
        console.log("Upgrading outdated projects schema in Firestore...");
        await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, 'projects', d.id))));
      }
      const seedPromises = DEFAULT_PROJECTS.map(proj => {
        const { id, ...rest } = proj;
        return addDoc(collection(db, 'projects'), rest);
      });
      await Promise.all(seedPromises);
      localStorage.setItem('okorie_projects', JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    console.warn("Firestore fetchProjects failed, falling back to local storage:", error);
    return JSON.parse(localStorage.getItem('okorie_projects') || '[]');
  }
};

export const addProject = async (proj: Omit<Project, 'id'>): Promise<Project> => {
  try {
    const docRef = await addDoc(collection(db, 'projects'), proj);
    const newProj = { id: docRef.id, ...proj };
    
    const local = JSON.parse(localStorage.getItem('okorie_projects') || '[]');
    localStorage.setItem('okorie_projects', JSON.stringify([newProj, ...local]));
    return newProj;
  } catch (error) {
    console.warn("Firestore addProject failed, performing local:", error);
    const local = JSON.parse(localStorage.getItem('okorie_projects') || '[]');
    const newProj = { id: 'local_' + Date.now(), ...proj };
    localStorage.setItem('okorie_projects', JSON.stringify([newProj, ...local]));
    return newProj;
  }
};

export const updateProject = async (proj: Project): Promise<void> => {
  try {
    const { id, ...rest } = proj;
    if (id.startsWith('local_')) throw new Error("Local item");
    const docRef = doc(db, 'projects', id);
    await updateDoc(docRef, { ...rest });
    
    const local: Project[] = JSON.parse(localStorage.getItem('okorie_projects') || '[]');
    const updated = local.map(p => p.id === id ? proj : p);
    localStorage.setItem('okorie_projects', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore updateProject failed, performing local:", error);
    const local: Project[] = JSON.parse(localStorage.getItem('okorie_projects') || '[]');
    const updated = local.map(p => p.id === proj.id ? proj : p);
    localStorage.setItem('okorie_projects', JSON.stringify(updated));
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    if (id.startsWith('local_')) throw new Error("Local item");
    const docRef = doc(db, 'projects', id);
    await deleteDoc(docRef);
    
    const local: Project[] = JSON.parse(localStorage.getItem('okorie_projects') || '[]');
    const updated = local.filter(p => p.id !== id);
    localStorage.setItem('okorie_projects', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore deleteProject failed, performing local:", error);
    const local: Project[] = JSON.parse(localStorage.getItem('okorie_projects') || '[]');
    const updated = local.filter(p => p.id !== id);
    localStorage.setItem('okorie_projects', JSON.stringify(updated));
  }
};

// ==========================================
// BLOG OPERATIONS
// ==========================================

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const q = query(collection(db, 'blog'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const hasOldData = snapshot.docs.some(doc => {
      const title = doc.data().title || "";
      return title.includes("Gender Equity Council") || title.includes("Ibibio Traditional Council") || title.includes("Theory with Grassroots Realities");
    });
    if (snapshot.empty || hasOldData) {
      if (hasOldData) {
        console.log("Upgrading outdated blog posts schema in Firestore...");
        await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, 'blog', d.id))));
      }
      const seedPromises = DEFAULT_BLOG_POSTS.map(post => {
        const { id, ...rest } = post;
        return addDoc(collection(db, 'blog'), rest);
      });
      await Promise.all(seedPromises);
      localStorage.setItem('okorie_blog', JSON.stringify(DEFAULT_BLOG_POSTS));
      return DEFAULT_BLOG_POSTS;
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
  } catch (error) {
    console.warn("Firestore fetchBlogPosts failed, falling back to local storage:", error);
    return JSON.parse(localStorage.getItem('okorie_blog') || '[]');
  }
};

export const addBlogPost = async (post: Omit<BlogPost, 'id'>): Promise<BlogPost> => {
  try {
    const docRef = await addDoc(collection(db, 'blog'), post);
    const newPost = { id: docRef.id, ...post };
    
    const local = JSON.parse(localStorage.getItem('okorie_blog') || '[]');
    localStorage.setItem('okorie_blog', JSON.stringify([newPost, ...local]));
    return newPost;
  } catch (error) {
    console.warn("Firestore addBlogPost failed, performing local:", error);
    const local = JSON.parse(localStorage.getItem('okorie_blog') || '[]');
    const newPost = { id: 'local_' + Date.now(), ...post };
    localStorage.setItem('okorie_blog', JSON.stringify([newPost, ...local]));
    return newPost;
  }
};

export const updateBlogPost = async (post: BlogPost): Promise<void> => {
  try {
    const { id, ...rest } = post;
    if (id.startsWith('local_')) throw new Error("Local item");
    const docRef = doc(db, 'blog', id);
    await updateDoc(docRef, { ...rest });
    
    const local: BlogPost[] = JSON.parse(localStorage.getItem('okorie_blog') || '[]');
    const updated = local.map(p => p.id === id ? post : p);
    localStorage.setItem('okorie_blog', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore updateBlogPost failed, performing local:", error);
    const local: BlogPost[] = JSON.parse(localStorage.getItem('okorie_blog') || '[]');
    const updated = local.map(p => p.id === post.id ? post : p);
    localStorage.setItem('okorie_blog', JSON.stringify(updated));
  }
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  try {
    if (id.startsWith('local_')) throw new Error("Local item");
    const docRef = doc(db, 'blog', id);
    await deleteDoc(docRef);
    
    const local: BlogPost[] = JSON.parse(localStorage.getItem('okorie_blog') || '[]');
    const updated = local.filter(p => p.id !== id);
    localStorage.setItem('okorie_blog', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore deleteBlogPost failed, performing local:", error);
    const local: BlogPost[] = JSON.parse(localStorage.getItem('okorie_blog') || '[]');
    const updated = local.filter(p => p.id !== id);
    localStorage.setItem('okorie_blog', JSON.stringify(updated));
  }
};

// ==========================================
// GALLERY OPERATIONS
// ==========================================

export const fetchGalleryImages = async (): Promise<GalleryImage[]> => {
  try {
    const q = query(collection(db, 'gallery'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const hasOldData = snapshot.docs.some(doc => {
      const caption = doc.data().caption || "";
      return caption.includes("Sociology of Development") || caption.includes("Ibibio traditions") || caption.includes("agricultural cooperative leaders");
    });
    if (snapshot.empty || hasOldData) {
      if (hasOldData) {
        console.log("Upgrading outdated gallery schema in Firestore...");
        await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, 'gallery', d.id))));
      }
      const seedPromises = DEFAULT_GALLERY_IMAGES.map(img => {
        const { id, ...rest } = img;
        return addDoc(collection(db, 'gallery'), rest);
      });
      await Promise.all(seedPromises);
      localStorage.setItem('okorie_gallery', JSON.stringify(DEFAULT_GALLERY_IMAGES));
      return DEFAULT_GALLERY_IMAGES;
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
  } catch (error) {
    console.warn("Firestore fetchGalleryImages failed, falling back to local storage:", error);
    return JSON.parse(localStorage.getItem('okorie_gallery') || '[]');
  }
};

export const addGalleryImage = async (img: Omit<GalleryImage, 'id'>): Promise<GalleryImage> => {
  try {
    const docRef = await addDoc(collection(db, 'gallery'), img);
    const newImg = { id: docRef.id, ...img };
    
    const local = JSON.parse(localStorage.getItem('okorie_gallery') || '[]');
    localStorage.setItem('okorie_gallery', JSON.stringify([newImg, ...local]));
    return newImg;
  } catch (error) {
    console.warn("Firestore addGalleryImage failed, performing local:", error);
    const local = JSON.parse(localStorage.getItem('okorie_gallery') || '[]');
    const newImg = { id: 'local_' + Date.now(), ...img };
    localStorage.setItem('okorie_gallery', JSON.stringify([newImg, ...local]));
    return newImg;
  }
};

export const deleteGalleryImage = async (id: string): Promise<void> => {
  try {
    if (id.startsWith('local_')) throw new Error("Local item");
    const docRef = doc(db, 'gallery', id);
    await deleteDoc(docRef);
    
    const local: GalleryImage[] = JSON.parse(localStorage.getItem('okorie_gallery') || '[]');
    const updated = local.filter(p => p.id !== id);
    localStorage.setItem('okorie_gallery', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore deleteGalleryImage failed, performing local:", error);
    const local: GalleryImage[] = JSON.parse(localStorage.getItem('okorie_gallery') || '[]');
    const updated = local.filter(p => p.id !== id);
    localStorage.setItem('okorie_gallery', JSON.stringify(updated));
  }
};

// ==========================================
// MESSAGE OPERATIONS
// ==========================================

export const fetchMessages = async (): Promise<ContactMessage[]> => {
  try {
    const q = query(collection(db, 'messages'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
  } catch (error) {
    console.warn("Firestore fetchMessages failed, falling back to local storage:", error);
    return JSON.parse(localStorage.getItem('okorie_messages') || '[]');
  }
};

export const addMessage = async (msg: Omit<ContactMessage, 'id'>): Promise<ContactMessage> => {
  try {
    const docRef = await addDoc(collection(db, 'messages'), msg);
    const newMsg = { id: docRef.id, ...msg };
    
    const local = JSON.parse(localStorage.getItem('okorie_messages') || '[]');
    localStorage.setItem('okorie_messages', JSON.stringify([newMsg, ...local]));
    return newMsg;
  } catch (error) {
    console.warn("Firestore addMessage failed, performing local:", error);
    const local = JSON.parse(localStorage.getItem('okorie_messages') || '[]');
    const newMsg = { id: 'local_' + Date.now(), ...msg };
    localStorage.setItem('okorie_messages', JSON.stringify([newMsg, ...local]));
    return newMsg;
  }
};

export const updateMessageReadStatus = async (id: string, read: boolean): Promise<void> => {
  try {
    if (id.startsWith('local_')) throw new Error("Local item");
    const docRef = doc(db, 'messages', id);
    await updateDoc(docRef, { read });
    
    const local: ContactMessage[] = JSON.parse(localStorage.getItem('okorie_messages') || '[]');
    const updated = local.map(m => m.id === id ? { ...m, read } : m);
    localStorage.setItem('okorie_messages', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore updateMessageReadStatus failed, performing local:", error);
    const local: ContactMessage[] = JSON.parse(localStorage.getItem('okorie_messages') || '[]');
    const updated = local.map(m => m.id === id ? { ...m, read } : m);
    localStorage.setItem('okorie_messages', JSON.stringify(updated));
  }
};

export const deleteMessage = async (id: string): Promise<void> => {
  try {
    if (id.startsWith('local_')) throw new Error("Local item");
    const docRef = doc(db, 'messages', id);
    await deleteDoc(docRef);
    
    const local: ContactMessage[] = JSON.parse(localStorage.getItem('okorie_messages') || '[]');
    const updated = local.filter(m => m.id !== id);
    localStorage.setItem('okorie_messages', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore deleteMessage failed, performing local:", error);
    const local: ContactMessage[] = JSON.parse(localStorage.getItem('okorie_messages') || '[]');
    const updated = local.filter(m => m.id !== id);
    localStorage.setItem('okorie_messages', JSON.stringify(updated));
  }
};
