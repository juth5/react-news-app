import { useQuery } from '@tanstack/react-query'

export type NewsItem = {
  title: string | null
  link: string | null
  pubDate: string | null
  source: string | null
}

async function fetchNews(newsKeyword: string): Promise<NewsItem[]> {
  const rssUrl = `/api/news?q=${encodeURIComponent(newsKeyword)}&hl=ja&gl=JP&ceid=JP:ja`;
  const res = await fetch(rssUrl)
  const xmlText = await res.text()
  const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml")
  const items = xmlDoc.querySelectorAll("item")

  return Array.from(items).slice(0, 10).map(item => ({
    title: item.querySelector("title")?.textContent ?? null,
    link: item.querySelector("link")?.textContent ?? null,
    pubDate: item.querySelector("pubDate")?.textContent ?? null,
    source: item.querySelector("source")?.textContent ?? null,
  }))
}

export function useNews(newsKeyword: string, enabled: boolean) {
  return useQuery({
    queryKey: ['news', newsKeyword],
    queryFn: () => fetchNews(newsKeyword),
    enabled,
  })
}
