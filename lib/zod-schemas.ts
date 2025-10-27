// lib/zod-schemas.ts
// Índice de schemas: RE-EXPORTA os que já existem nas telas (não move/renomeia nada).
// Se algum dos caminhos abaixo não existir no seu repo, mantenha comentado.

export * from '@/app/autocadastro/schema';   // ex.: pacienteFormSchema, etc.

// ⚠️ Este caminho não existe no repo atual e causava erro de build (TS2307):
// export * from '@/app/cadastro/schemas';    // Descomente quando o arquivo existir

// ---------------------------------------------------------------------------
// Fallback opcional (exemplo) — deixe comentado a menos que precise rapidamente
// de um schema local sem depender das telas. Evita quebrar imports, mas
// PREFIRA reexportar dos arquivos reais das páginas.
// ---------------------------------------------------------------------------
/*
import { z } from 'zod';

export const pacienteFormSchema = z.object({
  // Exemplo mínimo — ajuste conforme seus campos reais:
  nome: z.string().min(1, 'Obrigatório'),
  telefone: z.string().min(8, 'Telefone inválido'),
});
export type PacienteFormValues = z.infer<typeof pacienteFormSchema>;
*/