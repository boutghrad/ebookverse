import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  const results: Record<string, any> = {};
  
  // Test DNS/connectivity to internal-api.z.ai
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch('https://internal-api.z.ai/v1/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer Z.ai', 'X-Z-AI-From': 'Z' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }], max_tokens: 5, thinking: { type: 'disabled' } }),
    });
    results.internalApi = { status: res.status, body: (await res.text()).substring(0, 200) };
  } catch (e: any) {
    results.internalApi = { error: e.message?.substring(0, 100) || String(e) };
  }

  // Test BigModel
  try {
    const key = process.env.BIGMODEL_API_KEY;
    if (key) {
      const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model: 'glm-4-plus', messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 }),
      });
      results.bigModel = { status: res.status, body: (await res.text()).substring(0, 200) };
    }
  } catch (e: any) {
    results.bigModel = { error: e.message?.substring(0, 100) };
  }

  // Check env vars
  results.env = {
    ZAI_TOKEN: !!process.env.ZAI_TOKEN,
    ZAI_USER_ID: !!process.env.ZAI_USER_ID,
    BIGMODEL_API_KEY: !!process.env.BIGMODEL_API_KEY,
  };

  return NextResponse.json(results);
}
