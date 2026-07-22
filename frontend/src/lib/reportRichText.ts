const U_OPEN = '\uE000';
const U_CLOSE = '\uE001';
const RIGHT_OPEN = '\uE002';
const RIGHT_CLOSE = '\uE003';
const LEFT_OPEN = '\uE004';
const LEFT_CLOSE = '\uE005';

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    '&amp;': '&',
    '&gt;': '>',
    '&lt;': '<',
    '&nbsp;': ' ',
    '&quot;': '"',
    '&#39;': "'",
  };
  return value
    .replace(/&(amp|gt|lt|nbsp|quot|#39);/gi, (entity) => named[entity.toLowerCase()] ?? entity)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
}

function listItems(body: string): string[] {
  return [...body.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => match[1].trim());
}

/** Converts editor HTML into KEV's non-executable, display-safe report markup. */
export function richHtmlToReportMarkup(html: string): string {
  let value = html
    .replace(/<(b|strong)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(i|em)\b[^>]*>([\s\S]*?)<\/\1>/gi, '_$2_')
    .replace(/<(s|strike|del)\b[^>]*>([\s\S]*?)<\/\1>/gi, '~~$2~~')
    .replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, `${U_OPEN}$1${U_CLOSE}`)
    .replace(
      /<ol\b[^>]*>([\s\S]*?)<\/ol>/gi,
      (_, body: string) =>
        `${listItems(body)
          .map((item, index) => `${index + 1}. ${item}`)
          .join('\n')}\n`,
    )
    .replace(/<ul\b([^>]*)>([\s\S]*?)<\/ul>/gi, (_, attributes: string, body: string) => {
      const marker = /list-style-type\s*:\s*circle/i.test(attributes) ? '○' : '•';
      return `${listItems(body)
        .map((item) => `${marker} ${item}`)
        .join('\n')}\n`;
    })
    .replace(
      /<(div|p)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
      (_, _tag, attributes: string, body: string) => {
        if (/text-align\s*:\s*right/i.test(attributes))
          return `${RIGHT_OPEN}${body}${RIGHT_CLOSE}\n`;
        if (/text-align\s*:\s*left/i.test(attributes)) return `${LEFT_OPEN}${body}${LEFT_CLOSE}\n`;
        return `${body}\n`;
      },
    )
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  value = decodeEntities(value)
    .replaceAll(U_OPEN, '<u>')
    .replaceAll(U_CLOSE, '</u>')
    .replaceAll(RIGHT_OPEN, '<right>')
    .replaceAll(RIGHT_CLOSE, '</right>')
    .replaceAll(LEFT_OPEN, '<left>')
    .replaceAll(LEFT_CLOSE, '</left>');
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function hasVisibleReportContent(html: string): boolean {
  return (
    richHtmlToReportMarkup(html)
      .replace(/\*\*|~~|_|<\/?(?:u|left|right)>/g, '')
      .trim().length > 0
  );
}
