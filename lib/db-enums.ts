// lib/db-enums.ts
// Fonte única de enums usados pelo front (pacientes)

export const sexoOptions = ['M','F','OUTRO','NAO_INFORMADO'] as const;
export type Sexo = typeof sexoOptions[number];

export const estadoCivilOptions = [
  'SOLTEIRO','CASADO','DIVORCIADO','VIUVO','UNIAO_ESTAVEL','OUTRO','NAO_INFORMADO'
] as const;
export type EstadoCivil = typeof estadoCivilOptions[number];

// ➕ Quando surgir outra tela que use ENUM do DB público, adicione aqui.
