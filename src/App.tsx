import { useEffect, useState } from 'react'
import app from './lib/app'
import Category from './items/category/Category'
import Tab from './items/Tab'


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

function App() {

  const [videos, setVideos] = useState<YoutubeVideo[]>([])
  const [newsList, setNewsList] = useState<NewsItem[]>([])   // News用に追加
  const [currentTab, setCurrentTab] = useState("Youtube")
  const [currentCategory, setCurrentCategory] = useState("AI")
  
  // currentTab, currentCategoryの変数に応じて、useEffectでAPIを叩き分けるようにする
  useEffect(() => {
    const active = categories.find(c => c.id === currentCategory)
    const keyword = active?.label ?? ""
    const newsKeyword = active?.newsLabel ?? ""

    // Youtubeタブ
    const fetchVideos = async () => {
      const res: YoutubeSearchResponse = await app.api.requestApi('GET', '/search', {
        part: 'snippet', type: 'video', q: keyword, maxResults: 9,
      })
      setVideos(res.items)
    }

    // Newsタブ
    const fetchNews = async () => {
      const rssUrl = `/api/news?q=${encodeURIComponent(newsKeyword)}&hl=ja&gl=JP&ceid=JP:ja`;
      const res = await fetch(rssUrl)
      const xmlText = await res.text()
      const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml")
      const items = xmlDoc.querySelectorAll("item")

      const list: NewsItem[] = Array.from(items).slice(0, 10).map(item => ({
        title: item.querySelector("title")?.textContent ?? null,
        link: item.querySelector("link")?.textContent ?? null,
        pubDate: item.querySelector("pubDate")?.textContent ?? null,
        source: item.querySelector("source")?.textContent ?? null,
      }))
      setNewsList(list)
    }

    // currentTab で叩き分ける
    if (currentTab === "Youtube") {
      fetchVideos()
    } else {
      fetchNews()
    }
  }, [currentTab, currentCategory])   // ← タブとカテゴリ、どちらが変わっても再取得


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
          videos.length === 0 ? (
            <p className='text-white text-center'>読み込み中...</p>
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
                          className='block object-contain size-full mb-[8px]'
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
          newsList.length === 0 ? (
            <p>読み込み中...</p>
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
