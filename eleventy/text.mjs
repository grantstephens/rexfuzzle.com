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
