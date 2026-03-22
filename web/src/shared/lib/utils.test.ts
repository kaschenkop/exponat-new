import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra');
  });

  it('deduplicates conflicting Tailwind classes', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});
