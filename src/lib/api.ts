const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

/**
 * APIを叩く共通関数(エラーはすべて呼び出し元へ throw する)
 */
export async function requestApi(
  method: string,
  endpoint: string,
  params: Record<string, any> | null = null
) {
  let url = `${BASE_URL}${endpoint}`;

  // ② body を後から入れられるように型を明示
  const options: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // GET のクエリパラメータ設定(YouTube API の key は毎回自動付与)
  if (method.toUpperCase() === 'GET') {
    const queryString = new URLSearchParams({ ...params, key: API_KEY }).toString();
    url += `?${queryString}`;
  }

  // POST / PUT / PATCH の body 設定
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && params) {
    options.body = JSON.stringify(params);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: await response.text() };
    }

    // ③ status と data を持てるように型を広げる
    const error = new Error(`API Error: ${response.status}`) as Error & {
      status?: number;
      data?: any;
    };
    error.status = response.status;
    error.data = errorData;

    throw error;
  }

  if (response.status === 204) return null;

  return await response.json();
}