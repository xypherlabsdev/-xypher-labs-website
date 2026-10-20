// Everything the site says lives here, so copy changes never touch components.

export const site = {
  name: 'Xypher Labs',
  tagline: 'Everyday problems, decoded.',
  email: 'xypherlabs.dev@gmail.com',
  playUrl: 'https://play.google.com/store/apps/dev?id=5900765015751377896',
  country: 'India',
};

export const nav = [
  { label: 'Apps', href: '#apps' },
  { label: 'Approach', href: '#approach' },
  { label: 'Lab', href: '#lab' },
  { label: 'Contact', href: '#contact' },
];

export type App = {
  id: string;
  name: string;
  playName: string;
  category: string;
  smart?: string;
  tagline: string;
  description: string;
  features: string[];
  url: string;
  icon: string;
  shots: string[];
  bg: string;
  accent: string;
};

/**
 * Colours for the installs chart, one per app in this fixed order. Stepped for the dark band and
 * checked for colour-blind separation as neighbours in exactly this sequence, so keep the order.
 */
export const chartOrder = [
  { id: 'applock', color: '#199E70' },
  { id: 'autotally', color: '#C98500' },
  { id: 'sipience', color: '#3987E5' },
  { id: 'qrscan', color: '#D55181' },
] as const;

// Copy is taken from each app's Google Play listing.
export const apps: App[] = [
  {
    id: 'autotally',
    name: 'AutoTally',
    playName: 'Expense & Budget: AutoTally',
    category: 'Finance',
    smart: 'On-device parsing',
    tagline: 'Stop typing every expense.',
    description:
      'Reads the transaction alerts your bank already sends and turns them into a complete spending record. No bank login, no account, and your money data stays on your phone.',
    features: ['Bank alerts become transactions', 'Budgets, bills and subscriptions', 'Unsure entries wait for one tap'],
    url: 'https://play.google.com/store/apps/details?id=com.autotally.app',
    icon: 'apps/autotally-icon.webp',
    shots: ['apps/autotally-1.jpg', 'apps/autotally-2.jpg', 'apps/autotally-3.jpg'],
    bg: '#0A1A4A',
    accent: '#FFC531',
  },
  {
    id: 'applock',
    name: 'AppLock Vault',
    playName: 'AppLock Vault: Privacy Guard',
    category: 'Privacy',
    smart: 'AI face unlock',
    tagline: 'Lock apps. Stay private.',
    description:
      'Locks any app with fingerprint, PIN, pattern or your face, hides photos and videos in an encrypted vault, and quietly snaps whoever gets your PIN wrong.',
    features: ['Fingerprint, PIN, pattern or face', 'AES-256 encrypted photo vault', 'Intruder selfie on wrong attempts'],
    url: 'https://play.google.com/store/apps/details?id=com.vaultx.applock',
    icon: 'apps/applock-icon.webp',
    shots: ['apps/applock-1.jpg', 'apps/applock-2.jpg', 'apps/applock-3.jpg'],
    bg: '#04160C',
    accent: '#2BE375',
  },
  {
    id: 'sipience',
    name: 'Sipience',
    playName: 'Sipience : Water Reminder',
    category: 'Health',
    smart: 'Gemini assistant',
    tagline: 'Hydrate smarter.',
    description:
      'A water reminder that adapts to your day. Goals shift with the weather and how active you are, and an AI assistant answers your hydration questions.',
    features: ['Reminders with quiet hours', 'Goals that adapt to weather and activity', 'Track coffee, tea, juice and more'],
    url: 'https://play.google.com/store/apps/details?id=com.xypherlabs.sipience',
    icon: 'apps/sipience-icon.webp',
    shots: ['apps/sipience-1.jpg', 'apps/sipience-2.jpg', 'apps/sipience-3.jpg'],
    bg: '#06233A',
    accent: '#45C8FF',
  },
  {
    id: 'qrscan',
    name: 'QR & Barcode Scanner',
    playName: 'QR Scanner & Barcode Scanner',
    category: 'Utility',
    smart: 'ML Kit vision',
    tagline: 'Point. Tap. Done.',
    description:
      'Scans any QR code or barcode in milliseconds, even in low light, and creates your own codes for Wi-Fi, contacts and links. Fast, private and works offline.',
    features: ['EAN, UPC, Code 128, Data Matrix and more', 'Create QR codes for Wi-Fi and contacts', 'Scan straight from your gallery'],
    url: 'https://play.google.com/store/apps/details?id=com.xypher.qrscanpro',
    icon: 'apps/qr-icon.webp',
    shots: ['apps/qr-1.jpg', 'apps/qr-2.jpg', 'apps/qr-3.jpg'],
    bg: '#170F38',
    accent: '#A48BFF',
  },
];

export const principles = [
  {
    title: 'Useful first',
    body: 'Every app starts with one everyday problem: tracking money, guarding private apps, drinking enough water. If a feature does not help with that problem, it does not ship.',
  },
  {
    title: 'Private by default',
    body: 'No bank logins and no forced accounts. Wherever we can, your data is processed and kept on your own phone.',
  },
  {
    title: 'AI where it helps',
    body: 'AI does the fiddly parts: reading bank alerts, recognising your face, adapting goals to the weather. Everywhere else it stays out of your way.',
  },
];

export const stack = [
  'Kotlin',
  'Jetpack Compose',
  'Material 3',
  'Coroutines',
  'Hilt',
  'Room',
  'DataStore',
  'WorkManager',
  'Firebase',
  'ML Kit',
  'Gemini API',
  'TensorFlow Lite',
];

// Shown in the Lab terminal. Edit freely: these describe experiments, not announced products.
export const experiments = [
  { id: 'on-device-ocr', what: 'reads cards and receipts offline', status: 'testing' },
  { id: 'battery-iq', what: 'learns how your battery is ageing', status: 'building' },
  { id: 'doc-assistant', what: 'answers questions about your PDFs', status: 'prototype' },
];
