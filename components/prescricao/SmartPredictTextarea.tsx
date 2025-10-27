'use client';
import * as React from 'react';
import { z } from 'zod';

type SmartPredictTextareaProps = {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxSuggestions?: number; // default 3
  context?: string;        // ex.: "cefaleia, febre baixa"
  mode?: 'local' | 'server'; // novo: 'server' chama /api/ai/predict
};

const cfgSchema = z.object({
  maxSuggestions: z.number().min(1).max(5).optional(),
  context: z.string().max(500).optional(),
  mode: z.enum(['local','server']).optional(),
});

function tokenize(txt: string): string[] {
  return txt.toLowerCase().replace(/[^\p{L}\p{N}\s\-,.]/gu, '').split(/\s+/).filter(Boolean);
}
class NGram {
  private tri = new Map<string, Map<string, number>>();
  private vocab = new Set<string>();
  seed(phrases: string[]) { phrases.forEach(p => this.learn(p)); }
  learn(text: string) {
    const t = tokenize(text); t.forEach(w => this.vocab.add(w));
    for (let i=0;i<t.length-2;i++){
      const k = `${t[i]} ${t[i+1]}`; const next = t[i+2];
      if (!this.tri.has(k)) this.tri.set(k, new Map());
      const m = this.tri.get(k)!; m.set(next, (m.get(next) ?? 0)+1);
    }
  }
  suggest(line: string, k: number): string[] {
    const parts = tokenize(line);
    const last = parts.at(-1) ?? ''; const w1 = parts.at(-3) ?? ''; const w2 = parts.at(-2) ?? '';
    const key = `${w1} ${w2}`.trim(); const candidates: Array<[string,number]> = [];
    if (key.split(' ').length === 2 && this.tri.has(key)) for (const [w,c] of this.tri.get(key)!) candidates.push([w,c]);
    if (candidates.length < k && last) for (const w of this.vocab) if (w.startsWith(last) && w !== last) candidates.push([w,1]);
    const seen = new Set<string>(); const out: string[] = [];
    candidates.sort((a,b)=>b[1]-a[1]).forEach(([w])=>{ if(!seen.has(w)&&w!==last&&out.length<k){ out.push(w); seen.add(w);} });
    return out;
  }
}
const MED_SEED = [
  'tomar 1 comprimido a cada 8 horas',
  'usar via oral após as refeições',
  'avaliar retorno em 7 dias',
  'suspender em caso de alergia',
  'aplicar pomada duas vezes ao dia',
  'hidratar e repouso',
  'manter acompanhamento',
  'se persistirem os sintomas, retornar',
  'prescrever paracetamol se dor',
  'antibiótico conforme cultura',
];

export function SmartPredictTextarea(props: SmartPredictTextareaProps) {
  const { value, onChange } = props;
  const { maxSuggestions = 3, context = '', mode = 'local' } = cfgSchema.parse({
    maxSuggestions: props.maxSuggestions, context: props.context, mode: props.mode,
  });

  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [enabled, setEnabled] = React.useState(true);
  const modelRef = React.useRef<NGram>();
  const abortRef = React.useRef<AbortController | null>(null);

  // init local model
  React.useEffect(() => {
    const m = new NGram(); m.seed(MED_SEED);
    try { const saved = localStorage.getItem('klinikia.prescricao.corpus'); if (saved) m.learn(saved); } catch {}
    if (context) m.learn(context);
    modelRef.current = m;
  }, [context]);

  // learn from typing (local)
  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        const joined = (localStorage.getItem('klinikia.prescricao.corpus') ?? '') + ' ' + value;
        localStorage.setItem('klinikia.prescricao.corpus', joined.slice(-10000));
      } catch {}
      modelRef.current?.learn(value);
    }, 250);
    return () => clearTimeout(t);
  }, [value]);

  // fetch/generate suggestions
  React.useEffect(() => {
    if (!enabled) { setSuggestions([]); return; }
    if (mode === 'server') {
      abortRef.current?.abort();
      const ac = new AbortController(); abortRef.current = ac;
      const t = setTimeout(async () => {
        try {
          const res = await fetch('/api/ai/predict', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ prefix: value, context, k: maxSuggestions }),
            signal: ac.signal,
          });
          const data = await res.json();
          setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
        } catch { /* fallback */ setSuggestions(modelRef.current?.suggest(value, maxSuggestions) ?? []); }
      }, 150);
      return () => clearTimeout(t);
    } else {
      setSuggestions(modelRef.current?.suggest(value, maxSuggestions) ?? []);
    }
  }, [value, maxSuggestions, mode, enabled, context]);

  const accept = (s: string) => {
    if (!s) return;
    const needsSpace = value.length > 0 && !value.endsWith(' ');
    onChange(value + (needsSpace ? ' ' : '') + s);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    // Alt+1..5 aceita sugestão numerada (não captura números “normais” do texto)
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      const num = Number(e.key);
      if (num >= 1 && num <= Math.min(5, suggestions.length)) {
        e.preventDefault();
        accept(suggestions[num - 1]);
        return;
      }
      // Alt+P liga/desliga
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault(); setEnabled(v => !v); return;
      }
    }
    // Tab aceita 1ª
    if (e.key === 'Tab' && suggestions[0]) { e.preventDefault(); accept(suggestions[0]); return; }
    // Ctrl+Espaço força refresh (server/local)
    if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); /* efeito já atualiza automaticamente */ return; }
    // Esc limpa sugestões
    if (e.key === 'Escape') { e.preventDefault(); setSuggestions([]); return; }
  };

  return (
    <div className={props.className}>
      <div className="mb-2 flex gap-2 flex-wrap items-center">
        {suggestions.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => accept(s)}
            className="px-2 py-1 text-sm rounded border hover:bg-gray-50"
            aria-label={`Sugerir ${s}`}
            title={`Alt+${i+1}`}
          >
            <span className="font-semibold opacity-60 mr-1">{i+1}</span>{s}
          </button>
        ))}
        <label className="ml-auto text-xs flex items-center gap-2">
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          sugestões {enabled ? 'ligadas' : 'desligadas'} ({mode})
        </label>
      </div>

      <textarea
        id={props.id}
        placeholder={props.placeholder ?? 'Digite a prescrição...'}
        disabled={props.disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full min-h-[160px] rounded border p-3 outline-none focus:ring"
        aria-describedby={props.id ? `${props.id}-help` : undefined}
      />
      <p id={props.id ? `${props.id}-help` : undefined} className="mt-1 text-xs text-gray-500">
        Atalhos: <kbd>Alt</kbd>+<kbd>1..5</kbd> aceita; <kbd>Tab</kbd> aceita a 1ª;
        <kbd>Ctrl</kbd>+<kbd>Espaço</kbd> atualiza; <kbd>Alt</kbd>+<kbd>P</kbd> liga/desliga; <kbd>Esc</kbd> limpa.
      </p>
    </div>
  );
}
export default SmartPredictTextarea;