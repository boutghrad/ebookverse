import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, any> = {};

  // Check env vars
  results.envVars = {
    ZAI_TOKEN: process.env.ZAI_TOKEN ? `${process.env.ZAI_TOKEN.substring(0, 20)}...` : 'NOT SET',
    ZAI_USER_ID: process.env.ZAI_USER_ID || 'NOT SET',
    ZAI_API_KEY: process.env.ZAI_API_KEY || 'NOT SET',
    BIGMODEL_API_KEY: process.env.BIGMODEL_API_KEY ? `${process.env.BIGMODEL_API_KEY.substring(0, 10)}...` : 'NOT SET',
  };

  // Test BigModel API
  try {
    const bigModelKey = process.env.BIGMODEL_API_KEY;
    if (bigModelKey) {
      const bmResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bigModelKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4-plus',
          messages: [{ role: 'user', content: 'Say hi' }],
          max_tokens: 10,
        }),
      });
      results.bigModel = {
        status: bmResponse.status,
        body: (await bmResponse.text()).substring(0, 200),
      };
    } else {
      results.bigModel = 'NO_API_KEY';
    }
  } catch (e: any) {
    results.bigModel = { error: e.message };
  }

  // Test Z AI Internal API
  try {
    const zaiToken = process.env.ZAI_TOKEN;
    if (zaiToken) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer Z.ai',
        'X-Z-AI-From': 'Z',
        'X-Token': zaiToken,
      };
      const zaiUserId = process.env.ZAI_USER_ID;
      if (zaiUserId) headers['X-User-Id'] = zaiUserId;

      const zaiResponse = await fetch('https://internal-api.z.ai/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Say hi' }],
          max_tokens: 10,
          thinking: { type: 'disabled' },
        }),
      });
      results.zai = {
        status: zaiResponse.status,
        body: (await zaiResponse.text()).substring(0, 200),
      };
    } else {
      results.zai = 'NO_TOKEN';
    }
  } catch (e: any) {
    results.zai = { error: e.message };
  }

  return NextResponse.json(results, { status: 200 });
}
