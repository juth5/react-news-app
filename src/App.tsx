import { useEffect, useState } from 'react'
import app from './lib/app'

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
  { id: "Youtube", color: "bg-red" },
  { id: "News", color: "bg-blue" }
];

let categories = [
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
    // 外枠
    <div className="p12">
      {/* タブ */}
      <div className='f fb fc border-bottom border-white w-full mb18'>
        {/* mapで配列をループ */}
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`w128 fs20 text-white px20 py10 cursor-pointer ${currentTab === tab.id ? tab.color : 'bg-gray'} bold border border-white rounded-top-20 mr20 mr0-last`}
            onClick={() => setCurrentTab(tab.id)}>
            {tab.id}
          </div>
        ))}
      </div>
      {/* カテゴリー */}
      <div className='f fb fl overflow-x-scroll mb18'>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`${currentCategory === category.id ? "border-transparent" : "border-white" } flex-fixed border text-white rounded-10 px12 py2 mr8`}
            style={currentCategory === category.id ? { backgroundColor: category.color } : undefined }
            onClick={() => setCurrentCategory(category.id)}>
            {category.id}
          </button>
        ))}
      </div>

      {/* カレンとタブがYoutubeの場合 */}
      {currentTab === "Youtube" ? (
        // ───── Youtubeタブ ─────
        videos.length === 0 ? (
          <p>読み込み中...</p>
        ) : (
              <div className="row mxn12">
                {videos.map((video) => (
                  <a
                    key={video.id.videoId}
                    className='col4 block px12 mb18 s-col12 s-px12'
                    href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer">
                    <div className="f fclm s-full rounded-10 overflow-hidden hover-border-white">
                      <img
                        className='block object-fit-contain s-full mb8'
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title} />
                      <p className='fs18 text-white'>{video.snippet.title}</p>
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
              <div className="">
                {newsList.map((news, i) => (
                  <a
                    key={news.link ?? i}
                    className='block mb8'
                    href={news.link ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer">
                    <div className="s-full text-left rounded-10 p8 hover-border-white">
                      <p className='fs18 text-white mb2'>{news.title}</p>
                      <p className='fs14 text-gray'>{news.source} ・ {news.pubDate}</p>
                    </div>
                  </a>
                ))}
              </div>
            )
      )}
    </div>
  )
}

export default App
