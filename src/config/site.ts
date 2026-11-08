/**
 * Everything that identifies the site lives here, so a name, a link or a credit
 * changes in one place.
 */
export const SITE = {
  name: 'Explore Naogaon',
  nameBn: 'এক্সপ্লোর নওগাঁ',
  tagline: 'নওগাঁকে জানুন · ঘুরে দেখুন · মানচিত্রে রাখুন',
  description:
    'নওগাঁ জেলার ঐতিহ্য, প্রকৃতি ও ইতিহাসের ২৯টি দর্শনীয় স্থান ঘুরে দেখুন এবং নিজের ভ্রমণের অগ্রগতি মানচিত্রে রাখুন।',
  developer: {
    name: 'Md Rayhan Ali',
    url: 'https://www.facebook.com/NotJustRayhan',
  },
  /**
   * Put the Explore Naogaon Facebook page address here once the page exists
   * (for example "https://www.facebook.com/explorenaogaon"). While it is empty the
   * footer shows "coming soon" instead of a link, so nothing points to a wrong page.
   */
  facebookUrl: 'https://www.facebook.com/explorenaogaon',
  /** The shared download counter is hidden in the hero until it reaches this number. */
  downloadCounter: { minToShow: 0 },
  /** Short handle printed at the bottom of the downloadable map poster. */
  posterHandle: 'Explore Naogaon',
} as const
