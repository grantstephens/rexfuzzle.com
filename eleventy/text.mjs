export function firstSentence(html, { maxLength = 160 } = {}) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const match = text.match(/^.+?[.!?](?=\s|$)/);
  let sentence = match ? match[0] : text;
  if (sentence.length > maxLength) {
    sentence = sentence.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
  }
  return sentence;
}

export function readingTime(html, { wordsPerMinute = 200 } = {}) {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

export function firstBodyImage(html) {
  const match = html.match(/<img[^>]*\ssrc="([^"]+)"/);
  return match ? match[1] : null;
}

// Tags every off-site link with an analytics event, so "which references
// did people actually follow" is answerable - a plain pageview count can't
// tell you that. Skips links already carrying their own event (e.g. the
// nav's hand-tagged Mastodon link) and anything pointing back at the site.
export function tagOutboundLinks(html, siteHost) {
  return html.replace(
    /<a\s+([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/g,
    (match, before, href, after) => {
      if (/\bdata-umami-event=/.test(before + after)) return match;
      let host;
      try {
        host = new URL(href).host;
      } catch {
        return match;
      }
      if (host === siteHost) return match;
      return `<a ${before}href="${href}"${after} data-umami-event="Outbound Link" data-umami-event-url="${href}">`;
    }
  );
}
