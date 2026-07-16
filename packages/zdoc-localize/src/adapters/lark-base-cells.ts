import {LocalizeError} from '../domain/errors.js';

export function readBaseText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') {
    const markdownUrl = value.match(/^\[[^\]]*\]\((https?:\/\/[^)]+)\)$/);
    return markdownUrl?.[1] ?? value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.length > 0 ? readBaseText(value[0]) : '';
  if (typeof value === 'object') {
    const object = value as Record<string, unknown>;
    if (typeof object.link === 'string') return object.link;
    if (typeof object.text === 'string') return object.text;
    if (typeof object.name === 'string') return object.name;
    if (typeof object.value === 'string') return object.value;
  }
  return '';
}

export function writeBaseUrl(value: string | undefined): string | null {
  return value?.trim() || null;
}

export function writeBaseDateTime(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new LocalizeError({
      type: 'validation',
      subtype: 'base_datetime_invalid',
      message: `Invalid Base date-time value: ${value}`,
    });
  }

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  return `${byType.get('year')}-${byType.get('month')}-${byType.get('day')} ${byType.get('hour')}:${byType.get('minute')}:${byType.get('second')}`;
}

export function readProhibitedVariants(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(readBaseText).map((item) => item.trim()).filter(Boolean);
  const text = readBaseText(value).trim();
  if (!text) return [];
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (Array.isArray(parsed)) return parsed.map(readBaseText).map((item) => item.trim()).filter(Boolean);
    } catch {
      // Fall back to newline-delimited human input.
    }
  }
  return text.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

export function writeProhibitedVariants(values: string[] | undefined): string {
  return (values ?? []).map((item) => item.trim()).filter(Boolean).join('\n');
}
