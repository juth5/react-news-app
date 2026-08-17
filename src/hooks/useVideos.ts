import { useQuery } from '@tanstack/react-query'
import app from '../lib/app'

export type YoutubeVideo = {
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

type YoutubeSearchResponse = {
  items: YoutubeVideo[]
}

async function fetchVideos(keyword: string): Promise<YoutubeVideo[]> {
  const res: YoutubeSearchResponse = await app.api.requestApi('GET', '/search', {
    part: 'snippet', type: 'video', q: keyword, maxResults: 9,
  })
  return res.items
}

export function useVideos(keyword: string, enabled: boolean) {
  return useQuery({
    queryKey: ['videos', keyword],
    queryFn: () => fetchVideos(keyword),
    enabled,
  })
}
