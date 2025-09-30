import { z } from "zod";

export const pacienteIntakeSchema = z.object({
  // Dados pessoais
  nome: z.string().min(3, "Informe o nome completo"),
  data_nascimento: z.string().optional(), // "YYYY-MM-DD"
  sexo: z.enum(["M", "F", "OUTRO", "NAO_INFORMADO"]).default("NAO_INFORMADO"),
  estado_civil: z.enum(["SOLTEIRO","CASADO","DIVORCIADO","VIUVO","UNIAO_ESTAVEL","OUTRO","NAO_INFORMADO"]).default("NAO_INFORMADO"),
  cpf: z.string().optional(), // validar DV pode ser feito depois
  rg: z.string().optional(),
  profissao: z.string().optional(),

  // Contato
  telefone_whatsapp: z.string().min(8, "Informe um telefone válido"),
  telefone_fixo: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),

  // Endereço
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, "UF").optional(), // "SP", "RJ"...

  // Convênio
  convenio: z.string().optional(),
  numero_carteirinha: z.string().optional(),
  validade_carteirinha: z.string().optional(), // "YYYY-MM-DD"
  titular_plano: z.string().optional(),

  // Médicos (opcional)
  alergias: z.string().optional(),
  medicamentos_uso: z.string().optional(),
  doencas_cronicas: z.string().optional(),
  historico_cirurgico: z.string().optional(),
});

export type PacienteIntakeInput = z.infer<typeof pacienteIntakeSchema>;
