/**
 * The legal pages name only the analytics tools this build configured. Pure, Node-safe.
 *
 * The page JSON (site/src/content/pages/legal-*.json) is written for both tools on. At build time
 * scopeLegal(page, cfg) — cfg = resolveAnalytics(env), the same config the consent runtime reads —
 * drops every sentence and list item about a tool whose id is unset (GA4: PUBLIC_GA4_ID, PostHog:
 * PUBLIC_POSTHOG_KEY) and words the rest for one tool; with neither, it drops the consent copy too
 * (no banner ships). Turning a tool on later is setting its repository Variable; the copy follows.
 */

const GA = { name: 'Google Analytics 4', short: 'Google Analytics', corp: 'Google', mention: /Google|\b_ga\b|_ga_/ };
const PH = { name: 'PostHog', short: 'PostHog', corp: 'PostHog', mention: /PostHog|\bph_/i };
// Copy that only makes sense with a consent banner on the page (dropped when no tool is configured).
const CONSENT = /banner|\bAccept\b|\bReject\b|Cookie settings|consent|say yes|analytics (cookie|script|data)|What they collect|Why: to count|our processors/i;
const SENTENCE = /(?<=[.!?])\s+(?=[A-Z])/;

/** Which tools this build configured. @param {{ ga4Id?: string, posthogKey?: string }} [cfg] */
export function legalTools(cfg = {}) {
  const on = [cfg.ga4Id && GA, cfg.posthogKey && PH].filter(Boolean);
  const off = [GA, PH].filter((t) => !on.includes(t));
  return { on, off };
}

/** "Google Analytics and PostHog", one of them, or "" with neither. */
export const analyticsNames = (cfg, key = 'short') => legalTools(cfg).on.map((t) => t[key]).join(' and ');

function rewrite(text, { on, off }, paragraph = true) {
  if (!off.length) return text;
  let s = text;
  if (on.length === 1) {
    const [t] = on;
    s = s
      .replaceAll('Google Analytics and PostHog measure', `${t.short} measures`)
      .replaceAll('Google Analytics 4 and PostHog', t.name)
      .replaceAll('Google Analytics and PostHog', t.short)
      .replaceAll('and neither loads', 'and it does not load')
      .replaceAll('What they collect', 'What it collects')
      .replaceAll('The cookies they set are', 'The cookies it sets are')
      .replaceAll('stops both tools on the page and deletes their cookies', `stops ${t.name} on the page and deletes its cookies`)
      .replaceAll('Both act as our processors', `${t.corp} acts as our processor`)
      .replaceAll('Each handles it under its own privacy policy', 'It handles it under its own privacy policy');
  }
  const drop = (x) => off.some((t) => t.mention.test(x)) || (!on.length && CONSENT.test(x));
  const sentences = s.split(SENTENCE);
  // A paragraph whose lead sentence goes is about that tool (or the banner): the rest goes with it.
  if (paragraph && drop(sentences[0])) return '';
  return sentences.filter((x) => !drop(x)).join(' ');
}

const scopeItem = (item, tools) => {
  const text = `${item.title ?? ''} ${item.body ?? ''}`;
  if (tools.off.some((t) => t.mention.test(text)) || (!tools.on.length && CONSENT.test(text))) return null;
  return item;
};

/** A legal page with only the configured tools named. Other pages come back as they are. */
export function scopeLegal(page, cfg) {
  const tools = legalTools(cfg);
  if (!page || !String(page.id).startsWith('legal-') || !tools.off.length) return page;
  const sections = page.sections
    .map((section) => {
      const s = { ...section };
      if (Array.isArray(s.body)) s.body = s.body.map((p) => rewrite(p, tools)).filter(Boolean);
      else if (typeof s.body === 'string') s.body = rewrite(s.body, tools, false); // a hero lead: sentence by sentence
      if (Array.isArray(s.items)) s.items = s.items.map((i) => scopeItem(i, tools)).filter(Boolean);
      if (!tools.on.length && typeof s.heading === 'string') s.heading = s.heading.replace(/, only if you say yes$/, '');
      const empty = (Array.isArray(s.body) && !s.body.length && !s.items) || (Array.isArray(s.items) && !s.items.length && !s.body);
      return empty ? null : s;
    })
    .filter(Boolean);
  const description = scopeDescription(page.seo?.description ?? '', cfg);
  return { ...page, seo: { ...page.seo, description }, sections };
}

/** The privacy page's description (seo and the engine head) for this build. */
export function scopeDescription(text, cfg) {
  const names = analyticsNames(cfg);
  if (names === 'Google Analytics and PostHog') return text;
  return text
    .replaceAll('consent-based Google Analytics and PostHog', names ? `consent-based ${names}` : 'no consent analytics')
    .replaceAll('DOM VIRUS sets analytics cookies only if you accept.', names ? 'DOM VIRUS sets analytics cookies only if you accept.' : 'DOM VIRUS sets no cookies.');
}
