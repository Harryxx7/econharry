// 此文件保留为备用，前端现在调用 /api/ai-chat（Edge Function）
// Edge Function 位于 netlify/edge-functions/ai-chat.js
exports.handler = async function () {
  return {
    statusCode: 301,
    headers: { Location: '/api/ai-chat' },
    body: '',
  }
}
