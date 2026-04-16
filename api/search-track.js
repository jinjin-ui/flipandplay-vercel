export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  try {
    const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(q)}&limit=8&fmt=json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FlipAndPlay3F/1.0 (dongsanlibrary@kmu.ac.kr)',
        'Accept': 'application/json',
      }
    });
    const data = await response.json();
    const tracks = (data.recordings || [])
      .filter(r => r.length)
      .map(r => ({
        id: r.id,
        name: r.title,
        artist: r['artist-credit']?.map(a => a.name).join(', ') || '알 수 없음',
        duration: Math.round((r.length || 0) / 1000),
        thumb: '',
        albumName: r.releases?.[0]?.title || '',
      }));
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(tracks);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
