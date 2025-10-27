// app/api/ai/predict/route.ts
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import { z } from 'zod';

const bodySchema = z.object({
  prefix: z.string().min(1).max(600),
  context: z.string().max(1000).optional(),
  k: z.number().min(1).max(5).default(3),
});

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!profile || !['doctor','staff','admin'].includes((profile as any).role))
    return new Response('Forbidden', { status: 403 });

  const { prefix, context, k } = bodySchema.parse(await req.json());

  // ——— Provider switch (default: Anthropic) ———
  const provider = process.env.AI_SUGGESTION_PROVIDER ?? 'gemini';
  const timeoutMs = Number(process.env.AI_SUGGESTION_TIMEOUT_MS ?? 1200);
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeoutMs);

  try {
    let suggestions: string[] = [];

    if (provider === 'anthropic') {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5',
          max_tokens: 128,
          system:
            'Você ajuda médicos a completar prescrições em PT-BR. Responda **somente** JSON no formato {"sugestoes":["..."]}. Retorne no máximo K itens, cada um com até 4 palavras, sem PII.',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text:
`Contexto (não-identificável):
${context ?? ''}

Prefixo digitado:
${prefix}

K=${k}

Retorne somente:
{"sugestoes":["..."]}`,
                },
              ],
            },
          ],
        }),
        signal: c.signal,
      });
      if (!resp.ok) throw new Error(`Anthropic ${resp.status}`);
      const data = await resp.json();
      const txt: string =
        (data?.content?.[0]?.text as string) ?? '';
      try {
        const parsed = JSON.parse(txt);
        suggestions = Array.isArray(parsed?.sugestoes) ? parsed.sugestoes.slice(0, k) : [];
      } catch {
        // fallback: extrai ["..."] se vier com texto extra
        const match = txt.match(/\["[^]*?\]/);
        suggestions = match ? (JSON.parse(match[0]) as string[]).slice(0, k) : [];
      }
    } else {
      // fallback “local” se provider != anthropic
      suggestions = [];
    }

    clearTimeout(t);
    return Response.json({ suggestions });
  } catch (e) {
    clearTimeout(t);
    // fallback seguro: não falha a UX
    return Response.json({ suggestions: [] }, { status: 200 });
  }
}