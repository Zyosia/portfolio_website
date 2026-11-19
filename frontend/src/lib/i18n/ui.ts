import type { Locale } from './locales';

/*
 * Interface strings of the pages, per locale. Personal content (bio, CV, projects) lives in
 * src/content/, not here. The French object is typed against the English one, so a missing
 * translation fails type checking.
 */

const en = {
  skipToContent: 'Skip to content',
  nav: {
    label: 'Main',
    menu: 'Menu',
    projects: 'Projects',
    about: 'About',
    cv: 'CV',
    contact: 'Contact',
  },
  language: {
    label: 'Language',
  },
  theme: {
    toggle: 'Toggle colour theme',
  },
  footer: {
    source: 'Source of this site',
  },
  home: {
    viewProjects: 'View projects',
    getInTouch: 'Get in touch',
    featured: 'Featured projects',
    allProjects: 'all projects',
    skills: 'Skills',
    fullCv: 'full CV',
    talkTitle: "Let's talk",
    talkText: 'Have a project, a role or a question in mind? I read every message.',
    contactMe: 'Contact me',
  },
  projects: {
    title: 'Projects',
    description:
      'Selected software, AI and DevOps projects, with the context, the technical choices and the results.',
    lead: 'A selection of things I have built, with the context, the technical choices and what I learned.',
    empty: 'No projects published yet.',
    filterLabel: 'Filter projects by tag',
    all: 'All',
    draft: 'draft',
    tagsOf: (title: string) => `Tags of ${title}`,
    tags: 'Tags',
    liveDemo: 'Live demo',
    sourceCode: 'Source code',
    techStack: 'Tech stack',
    backToAll: 'All projects',
  },
  about: {
    title: 'About',
    description: (name: string) =>
      `About ${name}: background, interests in software, AI and DevOps, and skills.`,
    readCv: 'Read my CV',
    contactMe: 'Contact me',
    interests: 'Interests',
    skills: 'Skills',
  },
  cv: {
    title: 'CV',
    heading: 'Curriculum vitae',
    description: (name: string) =>
      `Curriculum vitae of ${name}: experience, education, skills, languages and certifications.`,
    downloadPdf: 'Download PDF',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
    certifications: 'Certifications',
    present: 'Present',
  },
  contact: {
    title: 'Contact',
    description: (name: string) =>
      `Get in touch with ${name} about a role, a project or a question.`,
    lead: 'A role, a project, a question about my work? Send me a message and I will reply by email.',
    elsewhere: 'Elsewhere',
    linkedinHint: 'Professional network',
    githubHint: 'Code and open source',
    requiredHint: 'Required fields are marked with an asterisk (*).',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    optional: '(optional)',
    message: 'Message',
    website: 'Website',
    send: 'Send message',
    noScript: 'This form needs JavaScript. You can also reach me through the links on this page.',
  },
  notFound: {
    title: 'Page not found',
    heading: '404: page not found',
    lead: 'This page does not exist or has moved. Check the address, or start again from the home page.',
    home: 'Back to home',
    projects: 'Browse projects',
  },
};

export type UiStrings = typeof en;

const fr: UiStrings = {
  skipToContent: 'Aller au contenu',
  nav: {
    label: 'Principale',
    menu: 'Menu',
    projects: 'Projets',
    about: 'À propos',
    cv: 'CV',
    contact: 'Contact',
  },
  language: {
    label: 'Langue',
  },
  theme: {
    toggle: 'Changer de thème',
  },
  footer: {
    source: 'Code source du site',
  },
  home: {
    viewProjects: 'Voir les projets',
    getInTouch: 'Me contacter',
    featured: 'Projets à la une',
    allProjects: 'tous les projets',
    skills: 'Compétences',
    fullCv: 'CV complet',
    talkTitle: 'Discutons',
    talkText: 'Un projet, un poste ou une question en tête ? Je lis tous les messages.',
    contactMe: 'Me contacter',
  },
  projects: {
    title: 'Projets',
    description:
      'Une sélection de projets en développement logiciel, IA et DevOps : contexte, choix techniques et résultats.',
    lead: 'Une sélection de réalisations, avec leur contexte, les choix techniques et ce que j’en ai appris.',
    empty: 'Aucun projet publié pour le moment.',
    filterLabel: 'Filtrer les projets par étiquette',
    all: 'Tous',
    draft: 'brouillon',
    tagsOf: (title) => `Étiquettes de ${title}`,
    tags: 'Étiquettes',
    liveDemo: 'Démo en ligne',
    sourceCode: 'Code source',
    techStack: 'Technologies',
    backToAll: 'Tous les projets',
  },
  about: {
    title: 'À propos',
    description: (name) =>
      `À propos de ${name} : parcours, intérêt pour le logiciel, l’IA et le DevOps, et compétences.`,
    readCv: 'Voir mon CV',
    contactMe: 'Me contacter',
    interests: 'Centres d’intérêt',
    skills: 'Compétences',
  },
  cv: {
    title: 'CV',
    heading: 'Curriculum vitae',
    description: (name) =>
      `Curriculum vitae de ${name} : expérience, formation, compétences, langues et certifications.`,
    downloadPdf: 'Télécharger le PDF',
    experience: 'Expérience',
    education: 'Formation',
    skills: 'Compétences',
    languages: 'Langues',
    certifications: 'Certifications',
    present: 'Aujourd’hui',
  },
  contact: {
    title: 'Contact',
    description: (name) =>
      `Contactez ${name} au sujet d’un poste, d’un projet ou pour toute question.`,
    lead: 'Un poste, un projet, une question sur mon travail ? Envoyez-moi un message, je vous répondrai par e-mail.',
    elsewhere: 'Ailleurs',
    linkedinHint: 'Réseau professionnel',
    githubHint: 'Code et open source',
    requiredHint: 'Les champs obligatoires sont marqués d’un astérisque (*).',
    name: 'Nom',
    email: 'E-mail',
    subject: 'Objet',
    optional: '(facultatif)',
    message: 'Message',
    website: 'Site web',
    send: 'Envoyer le message',
    noScript:
      'Ce formulaire nécessite JavaScript. Vous pouvez aussi me contacter via les liens de cette page.',
  },
  notFound: {
    title: 'Page introuvable',
    heading: '404 : page introuvable',
    lead: 'Cette page n’existe pas ou a été déplacée. Vérifiez l’adresse, ou repartez de l’accueil.',
    home: 'Retour à l’accueil',
    projects: 'Voir les projets',
  },
};

const UI: Readonly<Record<Locale, UiStrings>> = { en, fr };

export function ui(locale: Locale): UiStrings {
  return UI[locale];
}
