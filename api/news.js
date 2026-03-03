// /api/news.js — Vercel Serverless Function
// Proxies requests to Claude API so the API key stays server-side
// Set ANTHROPIC_API_KEY in Vercel Environment Variables

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Search for the very latest breaking news about the Iran war in the last 2-3 hours, focusing on Kuwait, Persian Gulf, Strait of Hormuz, GCC countries.

Return ONLY a valid JSON array of up to 5 news items. Each item must have:
- "titleAr": Arabic headline (translate if English source)
- "source": Source name  
- "sourceUrl": Full URL to the original article
- "category": one of "military", "politics", "economy", "local"

No markdown, no backticks, no explanation. Just the raw JSON array starting with [ and ending with ].`
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    
    // Extract text content from response
    const texts = (data.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');
    
    const clean = texts.replace(/```json|```/g, '').trim();
    const match = clean.match(/\[[\s\S]*?\]/);
    
    if (match) {
      try {
        const items = JSON.parse(match[0]);
        const validItems = items
          .filter(item => item.titleAr && item.sourceUrl)
          .slice(0, 5);
        return res.status(200).json({ items: validItems });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return res.status(200).json({ items: [] });
      }
    }
    
    return res.status(200).json({ items: [] });
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
