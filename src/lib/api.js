const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

/**
 * APIを叩く共通関数(エラーはすべて呼び出し元へ throw する)
 */
export async function requestApi(method, endpoint, params = null) {
  let url = `${BASE_URL}${endpoint}`;

  const options = {
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

  // fetch を実行(ネットワーク切断などの場合は fetch 自体が自動で throw されます)
  const response = await fetch(url, options);

  // ステータスコードが 200〜299 以外(エラー)の場合
  if (!response.ok) {
    // サーバーからエラー用のJSONが返ってきているかもしれないので取得を試みる
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {
      // JSON形式でないエラー(500 Internal Server Error のHTMLなど)の場合
      errorData = { message: await response.text() };
    }

    // 呼び出し側で使いやすいように、ステータスコードとエラー内容を持たせた Error を投げる
    const error = new Error(`API Error: ${response.status}`);
    error.status = response.status;   // 例: 400, 401, 404, 500
    error.data = errorData;           // サーバーから返ってきた詳細データ

    throw error; // ★ここで呼び出し側へエラーを渡す!
  }

  // 正常終了(204 No Content のようにレスポンスボディがない場合も考慮)
  if (response.status === 204) return null;

  return await response.json();
}
