export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  try {
    // 1. Access Token 발급
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });

    // 토큰 응답 텍스트 그대로 확인
    const tokenText = await tokenRes.text();
    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      return res.status(500).json({ error: 'token parse fail', raw: tokenText });
    }

    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'no access_token', tokenData });
    }

    const accessToken = tokenData.access_token;

    // 2. 트랙 검색
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=8&market=KR`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const searchData = await searchRes.json();

    const tracks = (searchData.tracks?.items || []).map(t => ({
      id: t.id,
      name: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      duration: Math.round(t.duration_ms / 1000),
      thumb: t.album.images?.[2]?.url || t.album.images?.[0]?.url || '',
      albumName: t.album.name,
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(tracks);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
