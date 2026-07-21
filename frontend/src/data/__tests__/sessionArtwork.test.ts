import { getSessionArtworkUrl, SESSION_ARTWORK_URLS } from '@/data/sessionArtwork';

describe('session artwork delivery', () => {
  it('uses Cloudinary auto-quality crops sized for each surface', () => {
    expect(SESSION_ARTWORK_URLS.thumbnail).toContain('q_auto:eco,c_fill,g_auto,w_288,h_288');
    expect(SESSION_ARTWORK_URLS.feature).toContain('w_960,h_540');
    expect(SESSION_ARTWORK_URLS.hero).toContain('w_960,h_1280');
  });

  it('selects varied campus images deterministically', () => {
    expect(getSessionArtworkUrl('thumbnail', '1')).toBe(getSessionArtworkUrl('thumbnail', '1'));
    expect(getSessionArtworkUrl('thumbnail', '1')).not.toBe(getSessionArtworkUrl('thumbnail', '2'));
  });
});
