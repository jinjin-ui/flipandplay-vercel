export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=8&country=KR`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      return res.status(500).json({ error: `iTunes API 오류: ${response.status}` });
    }

    const data = await response.json();
    const tracks = (data.results || []).map(t => ({
      id: String(t.trackId),
      name: t.trackName,
      artist: t.artistName,
      duration: Math.round((t.trackTimeMillis || 0) / 1000),
      thumb: t.artworkUrl60 || t.artworkUrl30 || '',
      albumName: t.collectionName || '',
    }));

    return res.status(200).json(tracks);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
