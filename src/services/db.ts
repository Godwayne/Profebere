import { 
  collection, 
  getDocs, 
  getDoc,
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Publication, BlogPost, Project, GalleryImage, ContactMessage,
  UserProfile, Transaction, Comment, DonationSettings, PaymentKeys, FavoriteItem, CMSPage, AdminSimCredentials,
  LiveChatMessage, ChatConfig
} from '../types';
import { sendEmailNotification } from './mail';

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
    dateAdded: '2026-01-15',
    isPaid: false
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
    dateAdded: '2026-02-10',
    isPaid: true,
    price: 12500,
    downloadUrl: 'https://arxiv.org/pdf/criminology_foundations_ebere_okorie.pdf'
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
    dateAdded: '2026-03-05',
    isPaid: false
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
    dateAdded: '2026-04-12',
    isPaid: true,
    price: 4500,
    downloadUrl: 'https://arxiv.org/pdf/demographic_factors_juvenile_okorie.pdf'
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
    if (!id.startsWith('local_')) {
      const docRef = doc(db, 'messages', id);
      await deleteDoc(docRef);
    }
    const local: ContactMessage[] = JSON.parse(localStorage.getItem('okorie_messages') || '[]');
    const updated = local.filter(m => m.id !== id);
    localStorage.setItem('okorie_messages', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore deleteMessage failed, performing local operation:", error);
    const local: ContactMessage[] = JSON.parse(localStorage.getItem('okorie_messages') || '[]');
    const updated = local.filter(m => m.id !== id);
    localStorage.setItem('okorie_messages', JSON.stringify(updated));
  }
};

// ==========================================
// USER PROFILE OPERATIONS
// ==========================================

export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    // Fallback to local storage profiles
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem('okorie_users') || '[]');
    const user = localUsers.find(u => u.uid === uid);
    return user || null;
  } catch (error) {
    console.warn("Firestore fetchUserProfile failed, falling back to local storage:", error);
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem('okorie_users') || '[]');
    const user = localUsers.find(u => u.uid === uid);
    return user || null;
  }
};

export const createUserProfile = async (
  uid: string, 
  email: string, 
  displayName: string, 
  isAdmin: boolean = false
): Promise<UserProfile> => {
  const newProfile: UserProfile = {
    uid,
    email,
    displayName,
    likedPublications: [],
    purchasedPublications: [],
    createdAt: new Date().toISOString(),
    isAdmin: isAdmin || email === "younggist212@gmail.com" || email === "admin@okorie.edu.ng"
  };

  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, newProfile);
    
    // Sync to local
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem('okorie_users') || '[]');
    const updated = [newProfile, ...localUsers.filter(u => u.uid !== uid)];
    localStorage.setItem('okorie_users', JSON.stringify(updated));
    return newProfile;
  } catch (error) {
    console.warn("Firestore createUserProfile failed, performing local operation:", error);
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem('okorie_users') || '[]');
    const updated = [newProfile, ...localUsers.filter(u => u.uid !== uid)];
    localStorage.setItem('okorie_users', JSON.stringify(updated));
    return newProfile;
  }
};

export const updateUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const docRef = doc(db, 'users', profile.uid);
    await setDoc(docRef, profile, { merge: true });
    
    // Sync to local
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem('okorie_users') || '[]');
    const updated = [profile, ...localUsers.filter(u => u.uid !== profile.uid)];
    localStorage.setItem('okorie_users', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore updateUserProfile failed, performing local operation:", error);
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem('okorie_users') || '[]');
    const updated = [profile, ...localUsers.filter(u => u.uid !== profile.uid)];
    localStorage.setItem('okorie_users', JSON.stringify(updated));
  }
};

export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(d => d.data() as UserProfile);
  } catch (error) {
    console.warn("Firestore fetchAllUsers failed, falling back to local storage:", error);
    return JSON.parse(localStorage.getItem('okorie_users') || '[]');
  }
};

export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', uid));
    
    // Sync to local
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem('okorie_users') || '[]');
    const updated = localUsers.filter(u => u.uid !== uid);
    localStorage.setItem('okorie_users', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore deleteUserProfile failed, performing local operation:", error);
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem('okorie_users') || '[]');
    const updated = localUsers.filter(u => u.uid !== uid);
    localStorage.setItem('okorie_users', JSON.stringify(updated));
  }
};


// ==========================================
// TRANSACTION & CHECKSUM OPERATIONS
// ==========================================

export const addTransaction = async (txn: Omit<Transaction, 'id'>): Promise<Transaction> => {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), txn);
    const newTxn = { id: docRef.id, ...txn };

    // Sync to local
    const localTxns = JSON.parse(localStorage.getItem('okorie_transactions') || '[]');
    localStorage.setItem('okorie_transactions', JSON.stringify([newTxn, ...localTxns]));
    return newTxn;
  } catch (error) {
    console.warn("Firestore addTransaction failed, performing local:", error);
    const id = 'local_txn_' + Date.now() + Math.random().toString(36).substring(5);
    const newTxn = { id, ...txn };
    const localTxns = JSON.parse(localStorage.getItem('okorie_transactions') || '[]');
    localStorage.setItem('okorie_transactions', JSON.stringify([newTxn, ...localTxns]));
    return newTxn;
  }
};

export const updateTransactionStatus = async (id: string, status: 'success' | 'failed'): Promise<void> => {
  try {
    if (!id.startsWith('local_')) {
      const docRef = doc(db, 'transactions', id);
      await updateDoc(docRef, { status });
    }
    // Sync local
    const localTxns: Transaction[] = JSON.parse(localStorage.getItem('okorie_transactions') || '[]');
    const updated = localTxns.map(t => t.id === id ? { ...t, status } : t);
    localStorage.setItem('okorie_transactions', JSON.stringify(updated));

    // Automated Transaction Emails upon successful completion
    if (status === 'success') {
      try {
        let txnData: Transaction | null = null;
        if (!id.startsWith('local_')) {
          const docRef = doc(db, 'transactions', id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            txnData = { id: snap.id, ...snap.data() } as Transaction;
          }
        }
        
        // If not loaded from firestore, check local transactions list
        if (!txnData) {
          const match = localTxns.find(t => t.id === id);
          if (match) txnData = match;
        }

        if (txnData) {
          const { userEmail, userName, type, amount, reference, publicationTitle } = txnData;
          if (type === 'purchase') {
            await sendEmailNotification({
              to: userEmail,
              type: 'purchase',
              metadata: {
                name: userName,
                itemName: publicationTitle,
                amount,
                reference
              }
            });

            // Notify administrative email config
            await sendEmailNotification({
              type: 'admin_alert',
              metadata: {
                alertTitle: 'Publication Book Purchased',
                alertBody: `User "${userName}" (${userEmail}) completed a purchase of "${publicationTitle}" for ₦${amount.toLocaleString()}. Receipt Reference: ${reference}`
              }
            });

          } else if (type === 'donation') {
            await sendEmailNotification({
              to: userEmail,
              type: 'donation',
              metadata: {
                name: userName,
                amount,
                reference
              }
            });

            // Notify administrative email config
            await sendEmailNotification({
              type: 'admin_alert',
              metadata: {
                alertTitle: 'New Research Donation Received',
                alertBody: `User "${userName}" (${userEmail}) completed a donation of ₦${amount.toLocaleString()} in support of criminological outreach. Reference: ${reference}`
              }
            });
          }
        }
      } catch (mailErr) {
        console.warn("Mail dispatch skipped/failed on successful payment update:", mailErr);
      }
    }
  } catch (error) {
    console.warn("Firestore updateTransactionStatus failed:", error);
    const localTxns: Transaction[] = JSON.parse(localStorage.getItem('okorie_transactions') || '[]');
    const updated = localTxns.map(t => t.id === id ? { ...t, status } : t);
    localStorage.setItem('okorie_transactions', JSON.stringify(updated));
  }
};

export const fetchUserTransactions = async (uid: string): Promise<Transaction[]> => {
  try {
    const q = query(collection(db, 'transactions'), where('userId', '==', uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  } catch (error) {
    console.warn("Firestore fetchUserTransactions failed, falling back to local:", error);
    const localTxns: Transaction[] = JSON.parse(localStorage.getItem('okorie_transactions') || '[]');
    return localTxns.filter(t => t.userId === uid);
  }
};

export const fetchAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'transactions'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  } catch (error) {
    console.warn("Firestore fetchAllTransactions failed, falling back to local:", error);
    return JSON.parse(localStorage.getItem('okorie_transactions') || '[]');
  }
};


// ==========================================
// COMMENT & ENGAGEMENT OPERATIONS
// ==========================================

export const addComment = async (comment: Omit<Comment, 'id'>): Promise<Comment> => {
  try {
    const docRef = await addDoc(collection(db, 'comments'), comment);
    const newComment = { id: docRef.id, ...comment };

    // Sync local
    const localComments = JSON.parse(localStorage.getItem('okorie_comments') || '[]');
    localStorage.setItem('okorie_comments', JSON.stringify([newComment, ...localComments]));
    return newComment;
  } catch (error) {
    console.warn("Firestore addComment failed, performing local:", error);
    const id = 'local_comment_' + Date.now();
    const newComment = { id, ...comment };
    const localComments = JSON.parse(localStorage.getItem('okorie_comments') || '[]');
    localStorage.setItem('okorie_comments', JSON.stringify([newComment, ...localComments]));
    return newComment;
  }
};

export const fetchPublicationComments = async (pubId: string): Promise<Comment[]> => {
  try {
    const q = query(collection(db, 'comments'), where('publicationId', '==', pubId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
  } catch (error) {
    console.warn("Firestore fetchPublicationComments failed, falling back to local:", error);
    const localComments: Comment[] = JSON.parse(localStorage.getItem('okorie_comments') || '[]');
    return localComments.filter(c => c.publicationId === pubId);
  }
};

export const fetchAllComments = async (): Promise<Comment[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'comments'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
  } catch (error) {
    console.warn("Firestore fetchAllComments failed, falling back to local:", error);
    return JSON.parse(localStorage.getItem('okorie_comments') || '[]');
  }
};

export const updateCommentStatus = async (id: string, status: 'approved' | 'rejected' | 'pending'): Promise<void> => {
  try {
    if (!id.startsWith('local_')) {
      const docRef = doc(db, 'comments', id);
      await updateDoc(docRef, { status });
    }
    const localComments: Comment[] = JSON.parse(localStorage.getItem('okorie_comments') || '[]');
    const updated = localComments.map(c => c.id === id ? { ...c, status } : c);
    localStorage.setItem('okorie_comments', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore updateCommentStatus failed:", error);
    const localComments: Comment[] = JSON.parse(localStorage.getItem('okorie_comments') || '[]');
    const updated = localComments.map(c => c.id === id ? { ...c, status } : c);
    localStorage.setItem('okorie_comments', JSON.stringify(updated));
  }
};

export const deleteComment = async (id: string): Promise<void> => {
  try {
    if (!id.startsWith('local_')) {
      const docRef = doc(db, 'comments', id);
      await deleteDoc(docRef);
    }
    const localComments: Comment[] = JSON.parse(localStorage.getItem('okorie_comments') || '[]');
    const updated = localComments.filter(c => c.id !== id);
    localStorage.setItem('okorie_comments', JSON.stringify(updated));
  } catch (error) {
    console.warn("Firestore deleteComment failed:", error);
    const localComments: Comment[] = JSON.parse(localStorage.getItem('okorie_comments') || '[]');
    const updated = localComments.filter(c => c.id !== id);
    localStorage.setItem('okorie_comments', JSON.stringify(updated));
  }
};

// ==========================================
// DYNAMIC CONFIGURATION & CMS OPERATIONS
// ==========================================

export const DEFAULT_DONATION_SETTINGS: DonationSettings = {
  enabled: true,
  title: "Support This Research Platform",
  description: "Your financial contributions help sustain academic investigations into local security systems, youth delinquency rehab systems, and community growth projects in Akwa Ibom State and broader Nigeria.",
  suggestedAmounts: [2000, 5000, 10000, 25000, 50000]
};

export const DEFAULT_PAYMENT_KEYS: PaymentKeys = {
  paystackPublicKey: "pk_test_d3a8e9e1c2b5b15b3c53046bcbf80c8df949e25d",
  paystackSecretKey: "sk_test_paystack_secret_key_placeholder",
  opayPublicKey: "",
  opaySecretKey: "",
  activeGateway: "paystack",
  paymentSystemsEnabled: true
};

// --- DONATION SETTINGS ---
export const fetchDonationSettings = async (): Promise<DonationSettings> => {
  try {
    const docRef = doc(db, 'settings', 'donation');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as DonationSettings;
    }
    await setDoc(docRef, DEFAULT_DONATION_SETTINGS);
    return DEFAULT_DONATION_SETTINGS;
  } catch (err) {
    console.warn("Firestore fetchDonationSettings failed, falling back to local:", err);
    const local = localStorage.getItem('okorie_donation_settings');
    return local ? JSON.parse(local) : DEFAULT_DONATION_SETTINGS;
  }
};

export const updateDonationSettings = async (settings: DonationSettings): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', 'donation');
    await setDoc(docRef, settings, { merge: true });
    localStorage.setItem('okorie_donation_settings', JSON.stringify(settings));
  } catch (err) {
    console.error("Firestore updateDonationSettings failed:", err);
    localStorage.setItem('okorie_donation_settings', JSON.stringify(settings));
  }
};

// --- PAYMENT KEYS SETTINGS ---
export const fetchPaymentKeys = async (): Promise<PaymentKeys> => {
  try {
    const docRef = doc(db, 'settings', 'payment');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as PaymentKeys;
    }
    await setDoc(docRef, DEFAULT_PAYMENT_KEYS);
    return DEFAULT_PAYMENT_KEYS;
  } catch (err) {
    console.warn("Firestore fetchPaymentKeys failed, falling back to local:", err);
    const local = localStorage.getItem('okorie_payment_keys');
    return local ? JSON.parse(local) : DEFAULT_PAYMENT_KEYS;
  }
};

export const updatePaymentKeys = async (keys: PaymentKeys): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', 'payment');
    await setDoc(docRef, keys, { merge: true });
    localStorage.setItem('okorie_payment_keys', JSON.stringify(keys));
  } catch (err) {
    console.error("Firestore updatePaymentKeys failed:", err);
    localStorage.setItem('okorie_payment_keys', JSON.stringify(keys));
  }
};

// --- ADMIN CREDENTIALS ---
export const DEFAULT_ADMIN_CREDS: AdminSimCredentials = {
  email: "admin@okorie.edu.ng",
  passwordHash: "Password123"
};

export const fetchAdminCredentials = async (): Promise<AdminSimCredentials> => {
  try {
    const docRef = doc(db, 'settings', 'admin_creds');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AdminSimCredentials;
    }
    await setDoc(docRef, DEFAULT_ADMIN_CREDS);
    return DEFAULT_ADMIN_CREDS;
  } catch (err) {
    console.warn("Firestore fetchAdminCredentials failed, falling back to local:", err);
    const local = localStorage.getItem('okorie_admin_creds');
    return local ? JSON.parse(local) : DEFAULT_ADMIN_CREDS;
  }
};

export const updateAdminCredentials = async (creds: AdminSimCredentials): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', 'admin_creds');
    await setDoc(docRef, creds, { merge: true });
    localStorage.setItem('okorie_admin_creds', JSON.stringify(creds));
  } catch (err) {
    console.error("Firestore updateAdminCredentials failed:", err);
    localStorage.setItem('okorie_admin_creds', JSON.stringify(creds));
  }
};

// --- FAVORITES SYSTEM ---
export const fetchUserFavorites = async (userId: string): Promise<FavoriteItem[]> => {
  try {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FavoriteItem));
  } catch (err) {
    console.warn("Firestore fetchUserFavorites failed, falling back to local storage:", err);
    const local: FavoriteItem[] = JSON.parse(localStorage.getItem('okorie_favorites') || '[]');
    return local.filter(f => f.userId === userId);
  }
};

export const addFavorite = async (favorite: Omit<FavoriteItem, 'id'>): Promise<FavoriteItem> => {
  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', favorite.userId),
      where('contentId', '==', favorite.contentId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error("Favorite item already exists.");
    }
    const docRef = await addDoc(collection(db, 'favorites'), favorite);
    const newFav = { id: docRef.id, ...favorite };
    
    const local: FavoriteItem[] = JSON.parse(localStorage.getItem('okorie_favorites') || '[]');
    localStorage.setItem('okorie_favorites', JSON.stringify([newFav, ...local]));
    return newFav;
  } catch (err) {
    console.warn("Firestore addFavorite failed, falling back to local:", err);
    const local: FavoriteItem[] = JSON.parse(localStorage.getItem('okorie_favorites') || '[]');
    const exists = local.some(f => f.userId === favorite.userId && f.contentId === favorite.contentId);
    if (exists) {
      throw new Error("Favorite item already exists.");
    }
    const newFav = { id: 'local_' + Date.now(), ...favorite };
    localStorage.setItem('okorie_favorites', JSON.stringify([newFav, ...local]));
    return newFav;
  }
};

export const removeFavorite = async (id: string, userId: string, contentId?: string): Promise<void> => {
  try {
    if (id && !id.startsWith('local_')) {
      await deleteDoc(doc(db, 'favorites', id));
    } else if (userId && contentId) {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('contentId', '==', contentId)
      );
      const snapshot = await getDocs(q);
      await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
    }
    
    const local: FavoriteItem[] = JSON.parse(localStorage.getItem('okorie_favorites') || '[]');
    const updated = local.filter(f => {
      if (id && f.id === id) return false;
      if (userId && contentId && f.userId === userId && f.contentId === contentId) return false;
      return true;
    });
    localStorage.setItem('okorie_favorites', JSON.stringify(updated));
  } catch (err) {
    console.error("Firestore removeFavorite failed:", err);
    const local: FavoriteItem[] = JSON.parse(localStorage.getItem('okorie_favorites') || '[]');
    const updated = local.filter(f => {
      if (id && f.id === id) return false;
      if (userId && contentId && f.userId === userId && f.contentId === contentId) return false;
      return true;
    });
    localStorage.setItem('okorie_favorites', JSON.stringify(updated));
  }
};

// --- CMS PAGES ---
export const fetchCMSPage = async (slug: string): Promise<CMSPage | null> => {
  try {
    const docRef = doc(db, 'pages', slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const page = docSnap.data() as CMSPage;
      if (page && page.profileImage) {
        if (
          page.profileImage.includes('assets/images') || 
          page.profileImage.includes('prof_ebere') || 
          page.profileImage.includes('faculty_prof') ||
          page.profileImage.includes('178198522') ||
          page.profileImage.includes('178198544')
        ) {
          page.profileImage = "https://i.imgur.com/uYvEwbo.jpeg";
        }
      }
      return page;
    }
    return null;
  } catch (err) {
    console.warn("Firestore fetchCMSPage failed, falling back to local:", err);
    const local: CMSPage[] = JSON.parse(localStorage.getItem('okorie_cms_pages') || '[]');
    const page = local.find(p => p.slug === slug) || null;
    if (page && page.profileImage) {
      if (
        page.profileImage.includes('assets/images') || 
        page.profileImage.includes('prof_ebere') || 
        page.profileImage.includes('faculty_prof') ||
        page.profileImage.includes('178198522') ||
        page.profileImage.includes('178198544')
      ) {
        page.profileImage = "https://i.imgur.com/uYvEwbo.jpeg";
      }
    }
    return page;
  }
};

export const saveCMSPage = async (slug: string, pageData: CMSPage): Promise<void> => {
  try {
    const docRef = doc(db, 'pages', slug);
    await setDoc(docRef, pageData, { merge: true });
    
    const local: CMSPage[] = JSON.parse(localStorage.getItem('okorie_cms_pages') || '[]');
    const updated = [pageData, ...local.filter(p => p.slug !== slug)];
    localStorage.setItem('okorie_cms_pages', JSON.stringify(updated));
  } catch (err) {
    console.error("Firestore saveCMSPage failed:", err);
    const local: CMSPage[] = JSON.parse(localStorage.getItem('okorie_cms_pages') || '[]');
    const updated = [pageData, ...local.filter(p => p.slug !== slug)];
    localStorage.setItem('okorie_cms_pages', JSON.stringify(updated));
  }
};

// --- LIVE CHAT INTERFACE AND CONFIG ---
export const fetchChatConfig = async (): Promise<ChatConfig> => {
  try {
    const docRef = doc(db, 'settings', 'chat_config');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ChatConfig;
    }
  } catch (err) {
    console.warn("Firestore fetchChatConfig failed, using default:", err);
  }
  
  // Return default chat config
  const localConfig = localStorage.getItem('okorie_chat_config');
  if (localConfig) {
    return JSON.parse(localConfig) as ChatConfig;
  }
  return {
    welcomeMessage: 'Greetings! I am the automated Academic Assistant for Professor Ebere Okorie. How can I assist you with your scholarly inquiries today?',
    suggestions: [
      "Can you tell me about Prof. Okorie's research studies?",
      "What articles or books has Prof. Ebere Okorie published?",
      "How do I email or visit the Department at UNIUYO?",
      "How can I donate or support his youth guidance programs?"
    ],
    assistantName: 'Academic Portal Assistant',
    chatbotEnabled: true
  };
};

export const saveChatConfig = async (config: ChatConfig): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', 'chat_config');
    await setDoc(docRef, config, { merge: true });
  } catch (err) {
    console.error("Firestore saveChatConfig failed:", err);
  }
  localStorage.setItem('okorie_chat_config', JSON.stringify(config));
};

export const logChatMessage = async (msg: Omit<LiveChatMessage, 'id'>): Promise<LiveChatMessage> => {
  const newId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const completeMsg: LiveChatMessage = { id: newId, ...msg };
  try {
    const docRef = doc(db, 'chat_messages', newId);
    await setDoc(docRef, completeMsg);
  } catch (err) {
    console.warn("Firestore logChatMessage failed, writing locally:", err);
  }
  
  const local: LiveChatMessage[] = JSON.parse(localStorage.getItem('okorie_chat_messages') || '[]');
  localStorage.setItem('okorie_chat_messages', JSON.stringify([completeMsg, ...local]));
  return completeMsg;
};

export const fetchChatMessages = async (): Promise<LiveChatMessage[]> => {
  try {
    const q = query(collection(db, 'chat_messages'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map(doc => doc.data() as LiveChatMessage);
    }
  } catch (err) {
    console.warn("Firestore fetchChatMessages failed, using local:", err);
  }
  return JSON.parse(localStorage.getItem('okorie_chat_messages') || '[]');
};

export const subscribeToChatMessages = (callback: (messages: LiveChatMessage[]) => void): (() => void) => {
  try {
    const q = query(collection(db, 'chat_messages'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data() as LiveChatMessage);
      // Synchronize to localStorage in the client
      localStorage.setItem('okorie_chat_messages', JSON.stringify(msgs));
      callback(msgs);
    }, (err) => {
      console.warn("Firestore collection onSnapshot listen error:", err);
    });
  } catch (err) {
    console.warn("Firestore subscription failed to initialize:", err);
  }
  return () => {};
};
