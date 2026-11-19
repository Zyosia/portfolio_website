import type { Locale } from './locales';

/*
 * Strings used by the client-side scripts (theme toggle, project filter, contact form).
 * Kept apart from the page dictionary so the browser bundle only ships these.
 * The French object is typed against the English one: a missing key fails type checking.
 */

export type ContactField = 'name' | 'email' | 'subject' | 'message';
export type ContactErrorCode = 'required' | 'invalid' | 'tooShort' | 'tooLong' | 'multiline';
export type ContactFailure = 'validation' | 'rate_limited' | 'unavailable' | 'network';

const en = {
  theme: {
    switchTo: (theme: 'light' | 'dark') => `Switch to ${theme} theme`,
  },
  filter: {
    results: (count: number, tag: string | null) => {
      const noun = count === 1 ? 'project' : 'projects';
      return tag === null
        ? `Showing all ${count} ${noun}`
        : `Showing ${count} ${noun} tagged ${tag}`;
    },
  },
  contact: {
    sending: 'Sending your message…',
    sendingButton: 'Sending…',
    success: 'Thank you! Your message has been sent. I will get back to you soon.',
    correctFields: 'Please correct the highlighted fields.',
    fieldError: (field: ContactField, code: ContactErrorCode, limit: number): string => {
      switch (code) {
        case 'required':
          return field === 'email' ? 'Please enter your email address.' : 'Please enter your name.';
        case 'invalid':
          return 'Please enter a valid email address, like name@example.com.';
        case 'tooShort':
          return `Please write at least ${limit} characters.`;
        case 'tooLong':
          return `Please keep this under ${limit} characters.`;
        case 'multiline':
          return 'This must fit on a single line.';
      }
    },
    failures: {
      validation: 'Some fields are invalid. Please check them and try again.',
      rate_limited:
        'You have sent several messages recently. Please wait a little before trying again, or reach me through the links on this page.',
      unavailable:
        'Your message could not be sent right now. Please try again later, or reach me through the links on this page.',
      network: 'The connection failed. Please check your internet connection and try again.',
    } satisfies Record<ContactFailure, string>,
  },
};

export type ClientStrings = typeof en;

const fr: ClientStrings = {
  theme: {
    switchTo: (theme) => `Passer au thème ${theme === 'dark' ? 'sombre' : 'clair'}`,
  },
  filter: {
    results: (count, tag) => {
      const noun = count <= 1 ? 'projet' : 'projets';
      if (tag !== null) return `${count} ${noun} avec l’étiquette ${tag}`;
      return count <= 1 ? `${count} projet affiché` : `Les ${count} projets sont affichés`;
    },
  },
  contact: {
    sending: 'Envoi de votre message…',
    sendingButton: 'Envoi…',
    success: 'Merci ! Votre message a bien été envoyé. Je vous répondrai rapidement.',
    correctFields: 'Veuillez corriger les champs signalés.',
    fieldError: (field, code, limit) => {
      switch (code) {
        case 'required':
          return field === 'email'
            ? 'Veuillez saisir votre adresse e-mail.'
            : 'Veuillez saisir votre nom.';
        case 'invalid':
          return 'Veuillez saisir une adresse e-mail valide, par exemple nom@exemple.fr.';
        case 'tooShort':
          return `Veuillez écrire au moins ${limit} caractères.`;
        case 'tooLong':
          return `Veuillez ne pas dépasser ${limit} caractères.`;
        case 'multiline':
          return 'Ce champ doit tenir sur une seule ligne.';
      }
    },
    failures: {
      validation: 'Certains champs sont invalides. Vérifiez-les puis réessayez.',
      rate_limited:
        'Vous avez envoyé plusieurs messages récemment. Patientez un peu avant de réessayer, ou contactez-moi via les liens de cette page.',
      unavailable:
        'Votre message n’a pas pu être envoyé pour le moment. Réessayez plus tard, ou contactez-moi via les liens de cette page.',
      network: 'La connexion a échoué. Vérifiez votre connexion internet puis réessayez.',
    },
  },
};

const CLIENT_STRINGS: Readonly<Record<Locale, ClientStrings>> = { en, fr };

export function clientStrings(locale: Locale): ClientStrings {
  return CLIENT_STRINGS[locale];
}
