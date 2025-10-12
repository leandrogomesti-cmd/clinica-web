"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function PacientesTable({
  data,
  loading,
  onEdit,
}: {
  data: any[];
  loading?: boolean;
  onEdit: (id: string) => void;
}) {
  if (loading)
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );

  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-3 py-2 w-24">Ações</th>
            <th className="text-left px-3 py-2">Nome</th>
            <th className="text-left px-3 py-2">Telefone</th>
            <th className="text-left px-3 py-2">Nascimento</th>
            <th className="text-left px-3 py-2">E-mail</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-3 py-2">
                <Button size="sm" variant="secondary" onClick={() => onEdit(p.id)}>
                  Editar
                </Button>
              </td>
              <td className="px-3 py-2">{p.full_name}</td>
              <td className="px-3 py-2">{p.phone || "-"}</td>
              <td className="px-3 py-2">{p.birth_date ?? "-"}</td>
              <td className="px-3 py-2">{p.email || "-"}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>
                Sem resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}