type TextNode = Pick<Text, "nodeValue">;
interface TextWrite {
  original: string | null;
  latest: string | null;
  abandoned: boolean;
}
interface StyleWrite {
  original: string;
  priority: string;
  latest: string;
  lastPriority: string;
  abandoned?: boolean;
}
interface StyleEntry {
  hadStyle: boolean;
  props: Map<string, StyleWrite>;
  latestAttribute: string | null;
  externalChange: boolean;
}
// Compare before writing and restoring: a newer host update always wins.
export class MutationLedger {
  private readonly text: Map<TextNode, TextWrite>;
  private readonly styles: Map<HTMLElement | SVGElement, StyleEntry>;
  constructor() {
    this.text = new Map();
    this.styles = new Map();
  }
  writeText(node: TextNode, value: string): boolean {
    let r = this.text.get(node);
    if (!r) {
      r = {
        original: node.nodeValue,
        latest: node.nodeValue,
        abandoned: false,
      };
      this.text.set(node, r);
    }
    if (r.abandoned || node.nodeValue !== r.latest) {
      r.abandoned = true;
      return false;
    }
    node.nodeValue = value;
    r.latest = value;
    return true;
  }
  writeStyle(
    el: HTMLElement | SVGElement,
    key: string,
    value: string,
    priority = "",
  ): boolean {
    if (!this.styles.has(el))
      this.styles.set(el, {
        hadStyle: el.hasAttribute("style"),
        props: new Map(),
        latestAttribute: el.getAttribute("style"),
        externalChange: false,
      });
    const entry = this.styles.get(el)!;
    if (el.getAttribute("style") !== entry.latestAttribute)
      entry.externalChange = true;
    let r = entry.props.get(key);
    if (!r) {
      r = {
        original: el.style.getPropertyValue(key),
        priority: el.style.getPropertyPriority(key),
        latest: el.style.getPropertyValue(key),
        lastPriority: el.style.getPropertyPriority(key),
      };
      entry.props.set(key, r);
    }
    if (
      r.abandoned ||
      el.style.getPropertyValue(key) !== r.latest ||
      el.style.getPropertyPriority(key) !== r.lastPriority
    ) {
      r.abandoned = true;
      return false;
    }
    if (r.latest === value && r.lastPriority === priority) return true;
    el.style.setProperty(key, value, priority);
    entry.latestAttribute = el.getAttribute("style");
    r.latest = el.style.getPropertyValue(key);
    r.lastPriority = el.style.getPropertyPriority(key);
    return true;
  }
  /** Observer filter: an unrelated host style change must still invalidate layout. */
  ownsStyleMutation(el: HTMLElement | SVGElement): boolean {
    const entry = this.styles.get(el);
    if (!entry) return false;
    const owned =
      !entry.externalChange &&
      el.getAttribute("style") === entry.latestAttribute;
    entry.externalChange = false;
    return owned;
  }
  restore() {
    for (const [node, r] of this.text)
      if (!r.abandoned && node.nodeValue === r.latest)
        node.nodeValue = r.original;
    for (const [el, entry] of this.styles) {
      for (const [key, r] of entry.props)
        if (
          !r.abandoned &&
          el.style.getPropertyValue(key) === r.latest &&
          el.style.getPropertyPriority(key) === r.lastPriority
        ) {
          if (r.original) el.style.setProperty(key, r.original, r.priority);
          else el.style.removeProperty(key);
        }
      if (!entry.hadStyle && !el.getAttribute("style"))
        el.removeAttribute("style");
    }
    this.text.clear();
    this.styles.clear();
  }
}
