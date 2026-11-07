export const SITE_NAME = "Loco Portal";
export const SITE_TAGLINE = "Independent Indian Railways locomotive reference";
export const OFFICIAL_URL = "https://indianrailways.gov.in/";
// Mandatory disclaimer, verbatim (the URL is rendered as a link by <OfficialDisclaimer />).
export const DISCLAIMER_BEFORE_URL =
  "Loco Portal is an independent, unofficial project. It is not officially affiliated with, endorsed by, sponsored by, or operated by Indian Railways or any Indian Railways zone, division, production unit, or government authority. The official website of Indian Railways is ";
// Set NEXT_PUBLIC_CONTACT_EMAIL when a real contact address exists. Until then the site says contact details are pending.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;
