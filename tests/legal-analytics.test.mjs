// The legal pages name only the analytics tools a build configured (site-kit/analytics/legal.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveAnalytics } from '../site-kit/analytics/config.mjs';
import { analyticsSnippet } from '../site-kit/analytics/snippet.mjs';
import { analyticsNames, scopeDescription, scopeLegal } from '../site-kit/analytics/legal.mjs';

const page = (id) => JSON.parse(readFileSync(new URL(`../site/src/content/pages/${id}.json`, import.meta.url), 'utf8'));
const LEGAL = ['legal-privacy', 'legal-cookies', 'legal-terms'];
const text = (cfg) => LEGAL.map((id) => JSON.stringify(scopeLegal(page(id), cfg))).join('\n');
const head = readFileSync(new URL('../site/src/content/heads/legal-privacy.html', import.meta.url), 'utf8');
const GA_ONLY = resolveAnalytics({ PUBLIC_GA4_ID: 'G-XXXXXXXXXX' });
const NONE = resolveAnalytics({});
const BOTH = resolveAnalytics({ PUBLIC_GA4_ID: 'G-XXXXXXXXXX', PUBLIC_POSTHOG_KEY: 'phc_test1234567890' });

test('GA4 only: the legal pages, head and banner never name PostHog', () => {
  const t = text(GA_ONLY);
  assert.doesNotMatch(t, /posthog|ph_/i);
  assert.match(t, /Google Analytics 4/);
  assert.match(t, /14 months/, 'GA retention text stays');
  assert.doesNotMatch(t, /Session recording/, 'no orphaned PostHog sentence');
  assert.match(t, /Google acts as our processor/);
  assert.doesNotMatch(scopeDescription(head, GA_ONLY), /posthog/i);
  assert.equal(analyticsNames(GA_ONLY), 'Google Analytics');
});

test('neither id: no analytics code, and no tool or consent banner named', () => {
  assert.equal(analyticsSnippet(NONE, {}), '');
  assert.doesNotMatch(text(NONE), /Google Analytics|posthog|_ga\b|dom-virus:consent|banner|Cookie settings/i);
  assert.doesNotMatch(scopeDescription(head, NONE), /Google Analytics|posthog/i);
});

test('both ids: the pages are the written copy, unchanged', () => {
  for (const id of LEGAL) assert.deepEqual(scopeLegal(page(id), BOTH), page(id));
  assert.equal(scopeDescription(head, BOTH), head);
});

test('PostHog init keeps heatmaps, autocapture and session recording off', () => {
  const runtime = readFileSync(new URL('../site-kit/analytics/runtime.mjs', import.meta.url), 'utf8');
  assert.match(runtime, /autocapture: false,\s+enable_heatmaps: false,/);
  assert.match(runtime, /disable_session_recording: true/);
});
