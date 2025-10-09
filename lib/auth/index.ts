// lib/auth/index.ts
export { default } from "./requireRole";           // default export
export { default as requireRole } from "./requireRole"; // named alias
export type { Role } from "./requireRole";         // reexport do tipo