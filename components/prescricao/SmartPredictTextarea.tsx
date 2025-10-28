<SmartPredictTextarea
  id="prescricao"
  className="mb-3"
  value={prescricao}
  onChange={setPrescricao}
  context={`${diagnostico}; ${conduta}; ${subjetivo}`}
  maxSuggestions={3}
  mode="server"
/>

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type SmartPredictTextareaProps = {
  id?: string;
  className?: string;
  value: string;
  onChange: (v: string) => void;
  context?: string;
  maxSuggestions?: number; // default 3
  mode?: 'local' | 'server' | 'auto'; // sem quebra: aceitar valores existentes
};

const SEED_MED = [
  'tomar 1 comprimido a cada 8 horas',
  'usar via oral após as refeições',
  'aplicar 1 gota em cada olho a cada 6 horas',
  'avaliar retorno em 7 dias',
  'suspender em caso de alergia',
  'hidratar e repouso',
  'se persistirem os sintomas, retornar',
  'prescrever paracetamol se dor',
  'antibiótico conforme cultura'
];

// ------ Utilidades de tokenização / caret ------
function isWordChar(ch: string) {
  return /\p{L}|\p{N}/u.test(ch);
}
function getTokenRange(text: string, caret: number) {
  // encontra [start,end) do token atual baseado no caret
  let s = caret - 1;
  while (s >= 0 && isWordChar(text[s])) s--;
  s++;
  let e = caret;
  while (e < text.length && isWordChar(text[e])) e++;
  return { start: s, end: e };
}
function replaceToken(text: string, range: { start: number; end: number }, word: string) {
  // substitui token por `word` + espaço
  const before = text.slice(0, range.start);
  const after = text.slice(range.end);
  const sep = before.length && !/\s$/.test(before) ? ' ' : '';
  return before + sep + word + (after.length && !/^\s/.test(after) ? ' ' : '') + after.replace(/^\s+/, ' ');
}

// ------ Modelo local (n-gram MUITO simples) ------
class NGram {
  tri = new Map<string, Map<string, number>>();
  vocab = new Set<string>();
  learn(text: string) {
    const toks = (text.toLowerCase().match(/\p{L}+\p{M}*|\p{N}+/gu) || []) as string[];
    toks.forEach((w) => this.vocab.add(w));
    for (let i = 0; i < toks.length - 2; i++) {
      const key = `${toks[i]} ${toks[i + 1]}`;
      const next = toks[i + 2];
      if (!this.tri.has(key)) this.tri.set(key, new Map());
      const m = this.tri.get(key)!;
      m.set(next, (m.get(next) || 0) + 1);
    }
  }
  suggest(line: string, limit: number, caret: number) {
    // usa contexto de 2 palavras + completa token parcial
    const left = line.slice(0, caret).toLowerCase();
    const toks = (left.match(/\p{L}+\p{M}*|\p{N}+/gu) || []) as string[];
    const last = toks.at(-1) || '';
    const k1 = toks.at(-3) || '';
    const k2 = toks.at(-2) || '';
    const key = `${k1} ${k2}`.trim();

    const out: string[] = [];
    const push = (w: string) => {
      if (!w) return;
      if (w === last) return; // não sugerir o mesmo token
      if (w.length <= 2) return; // evitar 'g', 'go'
      if (last && (!w.startsWith(last) || w.length - last.length < 2)) return; // evita 'g','go','got'
      if (!out.includes(w)) out.push(w);
    };

    if (k1 && k2 && this.tri.has(key)) {
      const map = this.tri.get(key)!;
      [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .forEach(([w]) => push(w));
    }
    if (out.length < limit && last) {
      // fallback por prefixo no vocabulário (palavra inteira somente)
      for (const w of this.vocab) push(w);
    }
    return out.slice(0, limit);
  }
}

// ------ chamada opcional ao servidor ------
async function fetchServerSuggestions(
  text: string,
  context: string | undefined,
  caret: number,
  limit: number
): Promise<string[]> {
  try {
    const r = await fetch('/api/ai/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, context, caret, limit })
    });
    if (!r.ok) throw new Error('server off');
    const j = await r.json().catch(() => null);
    const arr = (j?.suggestions ?? []) as string[];
    // saneamento: apenas palavras, sem prefixos curtíssimos
    return arr
      .map((s) => String(s).trim().toLowerCase())
      .filter((s) => s && !/\s/.test(s) && s.length > 2)
      .slice(0, limit);
  } catch {
    return [];
  }
}

// ------ Componente ------
export function SmartPredictTextarea({
  id,
  className,
  value,
  onChange,
  context,
  maxSuggestions = 3,
  mode = 'auto'
}: SmartPredictTextareaProps) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const [sugg, setSugg] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [caret, setCaret] = useState(0);

  const model = useMemo(() => {
    const m = new NGram();
    SEED_MED.forEach((s) => m.learn(s));
    return m;
  }, []);

  // aprende incrementalmente o que o médico digita
  useEffect(() => {
    model.learn(value);
  }, [value, model]);

  // Anti layout shift: barra com altura fixa
  const BAR_H = 40; // px

  const recompute = useCallback(
    async (reason: 'input' | 'cursor' | 'toggle') => {
      if (!enabled) {
        setSugg([]);
        return;
      }
      const ref = taRef.current;
      const pos = ref ? ref.selectionStart ?? value.length : value.length;
      setCaret(pos);

      const localFirst = mode === 'local' || mode === 'auto';
      const serverFirst = mode === 'server';

      let out: string[] = [];

      if (localFirst) {
        out = model.suggest(value, maxSuggestions, pos);
        if (out.length < maxSuggestions && mode === 'auto') {
          const server = await fetchServerSuggestions(value, context, pos, maxSuggestions);
          out = [...out, ...server.filter((w) => !out.includes(w))].slice(0, maxSuggestions);
        }
      } else if (serverFirst) {
        const server = await fetchServerSuggestions(value, context, pos, maxSuggestions);
        out = server.length ? server : model.suggest(value, maxSuggestions, pos);
      }

      // filtro final: remove progressões (g, go, got) e qualquer coisa não “palavra”
      const range = getTokenRange(value, pos);
      const current = value.slice(range.start, range.end).toLowerCase();
      const clean = out.filter(
        (w) =>
          /^\p{L}+\p{M}*|\p{N}+$/u.test(w) &&
          w !== current &&
          (!current || (w.startsWith(current) && w.length - current.length >= 2))
      );
      setSugg(clean.slice(0, maxSuggestions));
    },
    [context, enabled, maxSuggestions, mode, model, value]
  );

  // recomputa ao digitar/mover cursor
  useEffect(() => {
    const t = setTimeout(() => void recompute('input'), 90);
    return () => clearTimeout(t);
  }, [value, recompute]);
  useEffect(() => {
    const ref = taRef.current;
    if (!ref) return;
    const onSel = () => void recompute('cursor');
    ref.addEventListener('keyup', onSel);
    ref.addEventListener('click', onSel);
    return () => {
      ref.removeEventListener('keyup', onSel);
      ref.removeEventListener('click', onSel);
    };
  }, [recompute]);

  const accept = useCallback(
    (word: string) => {
      const ref = taRef.current;
      const pos = ref ? ref.selectionStart ?? value.length : value.length;
      const range = getTokenRange(value, pos);
      const next = replaceToken(value, range, word);
      onChange(next);
      // posiciona o caret ao fim da palavra recém inserida
      requestAnimationFrame(() => {
        const el = taRef.current;
        if (!el) return;
        const newPos = (range.start + (range.start > 0 && !/\s$/.test(value.slice(0, range.start)) ? 1 : 0) + word.length + 1);
        try {
          el.focus();
          el.setSelectionRange(newPos, newPos);
        } catch {}
      });
      setSugg([]); // oculta após aceitar
    },
    [onChange, value]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!enabled) return;
      // Alt+1..5 aceita a numerada
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const n = Number(e.key);
        if (n >= 1 && n <= 5) {
          const w = sugg[n - 1];
          if (w) {
            e.preventDefault();
            accept(w);
          }
          return;
        }
        if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setEnabled((v) => !v);
          return;
        }
      }
      // Tab aceita a 1ª sugestão
      if (e.key === 'Tab' && sugg[0]) {
        e.preventDefault(); // evita inserir tab/blur
        accept(sugg[0]);
        return;
      }
      // Esc limpa
      if (e.key === 'Escape') {
        if (sugg.length) {
          e.preventDefault();
          setSugg([]);
        }
      }
    },
    [accept, enabled, sugg]
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-slate-600">Sugestões</span>
        <button
          type="button"
          onClick={() => {
            setEnabled((v) => !v);
            requestAnimationFrame(() => recompute('toggle'));
          }}
          className={`h-6 px-2 rounded border text-xs ${enabled ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-300'}`}
          aria-pressed={enabled}
        >
          {enabled ? 'Ligado' : 'Desligado'} (Alt+P)
        </button>
      </div>

      {/* Barra anti layout-shift: altura fixa, overflow-x para rolar chips */}
      <div
        role="listbox"
        aria-label="Sugestões de palavras"
        className="relative mb-2"
        style={{ minHeight: BAR_H, height: BAR_H }}
      >
        <div className="absolute inset-0 flex items-center gap-2 overflow-x-auto whitespace-nowrap px-1">
          {enabled &&
            sugg.map((w, i) => (
              <button
                key={w}
                type="button"
                onClick={() => accept(w)}
                className="border rounded-full px-2 py-1 text-xs bg-white hover:bg-slate-50 shrink-0"
                aria-label={`Sugestão ${i + 1}: ${w}`}
                title={`Alt+${i + 1}`}
              >
                <span className="opacity-60 mr-1">{i + 1}</span>
                {w}
              </button>
            ))}
        </div>
      </div>

      <textarea
        id={id}
        ref={taRef}
        className="w-full min-h-[120px] border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={() => {/* nada: evita recompute excessivo */}}
        placeholder="Digite a prescrição… (Tab aceita a 1ª sugestão; Alt+1..5 aceita numeradas; Esc limpa)"
      />
      <div className="mt-2 text-[11px] text-slate-500">
        Dicas: <kbd className="px-1 border rounded">Tab</kbd> aceita 1ª ·{' '}
        <kbd className="px-1 border rounded">Alt</kbd>+<kbd className="px-1 border rounded">1..5</kbd> aceita numeradas ·{' '}
        <kbd className="px-1 border rounded">Esc</kbd> limpa ·{' '}
        <kbd className="px-1 border rounded">Alt</kbd>+<kbd className="px-1 border rounded">P</kbd> liga/desliga
      </div>
    </div>
  );
}