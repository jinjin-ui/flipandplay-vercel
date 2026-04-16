export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  const TTB_KEY = process.env.ALADIN_TTB_KEY;
  const url = `http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${TTB_KEY}&Query=${encodeURIComponent(q)}&QueryType=Keyword&MaxResults=8&start=1&SearchTarget=Book&output=js&Version=20131101&Cover=Big`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    const cleaned = text
      .replace(/^[^{[]*/, '')
      .replace(/;?\s*$/, '')
      .trim();

    const data = JSON.parse(cleaned);

    const books = (data.item || []).map(b => ({
      title: b.title?.replace(/\s*\(.*?\)\s*$/, '').trim(),
      author: b.author,
      publisher: b.publisher,
      pubDate: b.pubDate?.substring(0, 4),
      cover: b.cover?.replace('coversum', 'cover200'),
      isbn: b.isbn13,
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(books);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
