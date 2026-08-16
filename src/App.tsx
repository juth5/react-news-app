import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import app from './lib/app'
import Category from './items/modules/Category'
import Tab from './items/modules/Tab'

// 型定義
type YoutubeVideo = {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    channelTitle: string
    thumbnails: {
      medium: { url: string }
    }
  }
}

type NewsItem = {
  title: string | null
  link: string | null
  pubDate: string | null
  source: string | null
}

type YoutubeSearchResponse = {
  items: YoutubeVideo[]
}

let tabs = [
  { id: "Youtube", color: "bg-red-500" },
  { id: "News", color: "bg-blue-500" }
];

// このページがAPIを叩くために必要なデータの形。Categoryモジュールが要求する
// CategoryOption(id, color)を構造的に満たしているので、そのままpropsに渡せる。
type CategoryData = {
  id: string
  color: string
  label: string
  newsLabel: string
}

let categories: CategoryData[] = [
  { id: "AI", color: "#7C6BF5", label: "AI テレ東BIZ", newsLabel: "AI news 最新"},
  { id: "MCPサーバー", color: "#14B8A6", label: "MCPサーバー テレ東BIZ", newsLabel: "MCPサーバー news 最新"},
  { id: "OpenAI", color: "#10A37F", label: "OpenAI テレ東BIZ", newsLabel: "OpenAI news 最新"},
  { id: "Anthropic", color: "#D97757", label: "Anthropic テレ東BIZ", newsLabel: "Anthropic news 最新"},
];

// Youtubeタブ用のデータ取得(queryFn)
async function fetchVideos(keyword: string): Promise<YoutubeVideo[]> {
  const res: YoutubeSearchResponse = await app.api.requestApi('GET', '/search', {
    part: 'snippet', type: 'video', q: keyword, maxResults: 9,
  })
  return res.items
}

// Newsタブ用のデータ取得(queryFn)
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
function App() {
  const [currentTab, setCurrentTab] = useState("Youtube")
  const [currentCategory, setCurrentCategory] = useState("AI")

  const active = categories.find(c => c.id === currentCategory)
  const keyword = active?.label ?? ""
  const newsKeyword = active?.newsLabel ?? ""

  // currentTabがYoutubeのときだけ有効化(enabled)される、Youtube用のクエリ
  const { data: videos = [], isLoading: isVideosLoading, isError: isVideosError, error: videosError } = useQuery({
    queryKey: ['videos', keyword],
    queryFn: () => fetchVideos(keyword),
    enabled: currentTab === "Youtube",
  })

  // currentTabがNewsのときだけ有効化(enabled)される、News用のクエリ
  const { data: newsList = [], isLoading: isNewsLoading, isError: isNewsError, error: newsError } = useQuery({
    queryKey: ['news', newsKeyword],
    queryFn: () => fetchNews(newsKeyword),
    enabled: currentTab === "News",
  })


  return (
    <div className='py-[20px]'>
      <div className="max-w-5xl mx-auto">
        {/* タブ */}
        <Tab
          tabs={tabs}
          currentTabId={currentTab}
          onSelect={(tab) => setCurrentTab(tab.id)}
        />

        {/* カテゴリー */}
        <Category
          categories={categories}
          currentCategoryId={currentCategory}
          onSelect={(category) => setCurrentCategory(category.id)}
        />

        {/* カレンとタブがYoutubeの場合 */}
        {currentTab === "Youtube" ? (
          // ───── Youtubeタブ ─────
          isVideosLoading ? (
            <p className='text-white text-center'>読み込み中...</p>
          ) : isVideosError ? (
            <p className='text-white text-center'>動画の取得に失敗しました: {videosError.message}</p>
          ) : (
                <div className="flex flex-wrap mx-0 sm:-mx-[12px] px-[12px] sm:px-0">
                  {videos.map((video) => (
                    <a
                      key={video.id.videoId}
                      className='w-full sm:w-1/3 block px-[12px] mb-[18px] hover:bg-white/20 transition-colors duration-200 rounded-[10px] py-[12px]'
                      href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer">
                      <div className="flex flex-col size-full rounded-[10px] overflow-hidden hover-border-white">
                        <img
                          className='block object-contain mb-[8px]'
                          src={video.snippet.thumbnails.medium.url}
                          alt={video.snippet.title} />
                        <p className='p-[8px] text-sm sm:text-base text-white'>{video.snippet.title}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )
        ) : (
          // ───── Newsタブ ─────
          isNewsLoading ? (
            <p className='text-white text-center'>読み込み中...</p>
          ) : isNewsError ? (
            <p className='text-white text-center'>ニュースの取得に失敗しました: {newsError.message}</p>
          ) : (
                <div className="px-[12px] sm:px-0">
                  {newsList.map((news, i) => (
                    <a
                      key={news.link ?? i}
                      className='block border-b border-gray-500 hover:bg-white/20 transition-colors duration-300'
                      href={news.link ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer">
                      <div className="size-full text-left rounded-[10px] p-[10px]">
                        <p className='text-lg text-white mb-[2px]'>{news.title}</p>
                        <p className='text-sm text-gray-400'>{news.source} ・ {news.pubDate}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )
        )}
      </div>
    </div>
  )
}

export default App
