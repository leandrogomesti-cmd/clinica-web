// lib/zod-schemas.ts
// Índice de schemas: RE-EXPORTA os que já existem nas telas (não move/renomeia nada).
// Se algum dos caminhos abaixo não existir no seu repo, comente a linha e me avise.

export * from '@/app/autocadastro/schema';   // ex.: exporta pacienteFormSchema, etc.
export * from '@/app/cadastro/schemas';      // idem

// ⚠️ Caso NÃO existam exports nomeados nesses arquivos,
// deixe-me saber que eu te mando a versão fallback abaixo:

/*
import { z } from 'zod';
import { sexoOptions, estadoCivilOptions } from './db-enums';

export const pacienteFormSchema = z.object({
  sexo: z.enum(sexoOptions, { required_error: 'Selecione o sexo' }),
  estado_civil: z.enum(estadoCivilOptions).optional(),
  // ...outros campos do seu form real
});
export type PacienteFormValues = z.infer<typeof pacienteFormSchema>;
*/
