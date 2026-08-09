export default async function handler(req, res) {
  // フロントから渡ってきたクエリ(q, hl, gl, ceid など)をそのまま使う
  const searchParams = new URLSearchParams(req.query).toString();
  const targetUrl = `https://news.google.com/rss/search?${searchParams}`;

  try {
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Failed to fetch Google News' });
    }

    const xml = await response.text();

    // RSSはXMLなのでcontent-typeを合わせて返す
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // 少しキャッシュさせておくと負荷軽減になる(任意)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}