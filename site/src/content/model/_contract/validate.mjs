// The content contract as code: a small JSON Schema subset plus the rules a schema can't say.
// Pure and self-contained (only node:crypto): the factory uses it, and `fe content collections`
// copies this exact file into each site so its CI gate runs the same checks.
import { createHash } from "node:crypto";

export const LIFECYCLE = ["idea", "draft", "scheduled", "published"];
// A game's development status, read as a content lifecycle.
export const GAME_LIFECYCLE = { idea: "idea", "in-progress": "draft", released: "published" };

const typeOf = (v) => (Array.isArray(v) ? "array" : v === null ? "null" : Number.isInteger(v) ? "integer" : typeof v);
const resolve = (schema, root) => (schema.$ref ? schema.$ref.slice(2).split("/").reduce((o, k) => o[k], root) : schema);

/** Errors for `value` against `schema` (type, enum, const, pattern, lengths, ranges, items, properties, $ref, oneOf). */
export function validate(value, schema, at = "entry", root = schema) {
  schema = resolve(schema, root);
  const errs = [];
  if (schema.oneOf) {
    // Discriminated union: pick the branch whose `type` const matches, else report the choices.
    const branches = schema.oneOf.map((b) => resolve(b, root));
    const pick = branches.find((b) => b.properties?.type?.const === value?.type);
    if (pick) return validate(value, pick, at, root);
    return [`${at}: type must be one of ${branches.map((b) => b.properties?.type?.const).join(", ")}`];
  }
  if (schema.const !== undefined && value !== schema.const) errs.push(`${at}: must be ${schema.const}`);
  if (schema.enum && !schema.enum.includes(value)) errs.push(`${at}: must be one of ${schema.enum.join(", ")}`);
  if (schema.type) {
    const t = typeOf(value), want = [].concat(schema.type);
    if (!want.some((w) => w === t || (w === "number" && t === "integer"))) return [...errs, `${at}: expected ${want.join(" or ")}, got ${t}`];
  }
  if (typeof value === "string") {
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errs.push(`${at}: "${value}" does not match ${schema.pattern}`);
    if (schema.minLength && value.length < schema.minLength) errs.push(`${at}: ${value.length} chars, min ${schema.minLength}`);
    if (schema.maxLength && value.length > schema.maxLength) errs.push(`${at}: ${value.length} chars, max ${schema.maxLength}`);
  }
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) errs.push(`${at}: below ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errs.push(`${at}: above ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) errs.push(`${at}: ${value.length} items, min ${schema.minItems}`);
    if (schema.maxItems && value.length > schema.maxItems) errs.push(`${at}: ${value.length} items, max ${schema.maxItems}`);
    if (schema.items) value.forEach((v, i) => errs.push(...validate(v, schema.items, `${at}[${i}]`, root)));
  }
  if (typeOf(value) === "object") {
    for (const k of schema.required ?? []) if (!(k in value)) errs.push(`${at}: missing ${k}`);
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties?.[k]) errs.push(...validate(v, schema.properties[k], `${at}.${k}`, root));
      else if (schema.additionalProperties === false) errs.push(`${at}: unknown key ${k}`);
      else if (typeof schema.additionalProperties === "object") errs.push(...validate(v, schema.additionalProperties, `${at}.${k}`, root));
    }
  }
  return errs;
}

// --- the model: { games, brands, posts, pages } as arrays of source objects -----------------------

/** A content entry's lifecycle state (games map their development status). */
export const statusOf = (collection, e) => (collection === "games" ? GAME_LIFECYCLE[e.status] : collection === "brands" ? null : e.status);

/** Game ids a post or page names: its `games` list. */
const gamesOf = (e) => e.games ?? [];

/** Reverse relations, computed (never stored in source): game ↔ posts/pages ↔ brand. */
export function relations(model) {
  const out = { games: {}, brands: {}, posts: {}, pages: {} };
  for (const g of model.games) out.games[g.id] = { brand: g.brand, builtFrom: g.builtFrom ?? [], posts: [], pages: [] };
  for (const b of model.brands) out.brands[b.id] = { games: model.games.filter((g) => g.brand === b.id).map((g) => g.id), posts: [], pages: [] };
  for (const c of ["posts", "pages"]) for (const e of model[c]) {
    out[c][e.id] = { brand: e.brand, games: gamesOf(e) };
    for (const id of gamesOf(e)) out.games[id]?.[c].push(e.id);
    out.brands[e.brand]?.[c].push(e.id);
  }
  return out;
}

/** Cross-entry rules: unique ids and slugs, relations resolve, lifecycle and dates are sane. */
export function checkModel(model, { game, content }) {
  const errs = [];
  for (const g of model.games) errs.push(...validate(g, game, `games/${g.id}`));
  for (const [c, def] of [["brands", "brand"], ["posts", "post"], ["pages", "page"]])
    for (const e of model[c]) errs.push(...validate(e, { $ref: `#/$defs/${def}` }, `${c}/${e.id}`, content));
  const ids = new Set(model.games.map((g) => g.id)), brands = new Set(model.brands.map((b) => b.id));
  for (const c of ["games", "brands", "posts", "pages"]) {
    const seen = new Set();
    for (const e of model[c]) { if (seen.has(e.id)) errs.push(`${c}/${e.id}: duplicate id`); seen.add(e.id); }
  }
  const routes = new Map();
  for (const c of ["posts", "pages"]) for (const e of model[c]) {
    const at = `${c}/${e.id}`, route = `${e.site} ${e.type} ${e.slug}`;
    if (routes.has(route)) errs.push(`${at}: same site, type and slug as ${routes.get(route)}`);
    routes.set(route, at);
    if (!brands.has(e.brand)) errs.push(`${at}: unknown brand ${e.brand}`);
    for (const g of gamesOf(e)) if (!ids.has(g)) errs.push(`${at}: unknown game ${g}`);
    if ((e.status === "scheduled") !== Boolean(e.publishAt)) errs.push(`${at}: publishAt is set exactly when status is scheduled`);
    if (c === "posts" && ["scheduled", "published"].includes(e.status) && !e.date) errs.push(`${at}: a ${e.status} post needs its date`);
    if (e.publishAt && e.date && e.publishAt < e.date) errs.push(`${at}: publishAt is before date`);
    if (e.status !== "idea") for (const k of ["lead", "seo"]) if (!e[k]?.length && !e[k]?.title) errs.push(`${at}: a ${e.status} entry needs ${k} (only ideas may leave copy out)`);
  }
  for (const g of model.games) {
    if (!brands.has(g.brand)) errs.push(`games/${g.id}: unknown brand ${g.brand}`);
    for (const b of g.builtFrom ?? []) if (!ids.has(b)) errs.push(`games/${g.id}: builtFrom unknown game ${b}`);
  }
  return errs;
}

// --- generated files: a stamp makes hand edits fail the gate ------------------------------------
const canonical = (v) => (Array.isArray(v) ? `[${v.map(canonical).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}` : JSON.stringify(v));
export const hash = (v) => createHash("sha256").update(canonical(v)).digest("hex").slice(0, 16);
export const GENERATOR = "brain-cache/fizlet-engine: fe content collections (generated, never hand-edit)";

/** One collection file: the source entry plus its lifecycle and relations, stamped. */
export function collectionEntry(collection, { $schema: _ref, ...data }, rel) {
  const body = { collection, id: data.id, slug: data.slug ?? data.id, status: statusOf(collection, data) ?? null, relations: rel, data };
  return { $generated: { by: GENERATOR, hash: hash(body) }, ...body };
}

/** Errors for a collection file read back from a site: hand-edited, or out of step with its data. */
export function checkStamp(file, at) {
  const { $generated, ...body } = file;
  if ($generated?.by !== GENERATOR) return [`${at}: not generated by fe content collections`];
  return $generated.hash === hash(body) ? [] : [`${at}: edited by hand (hash mismatch); change the source in fizlet-engine and regenerate`];
}
