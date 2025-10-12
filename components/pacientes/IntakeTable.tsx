"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function IntakeTable({
  data,
  loading,
  onView,
}: {
  data: any[];
  loading?: boolean;
  onView: (id: string) => void;
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
            <th className="text-left px-3 py-2">CPF</th>
            <th className="text-left px-3 py-2">Telefone</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-left px-3 py-2">Criado em</th>
          </tr>
        </thead>
        <tbody>
          {data.map((i) => (
            <tr key={i.id} className="border-t">
              <td className="px-3 py-2">
                <Button size="sm" variant="secondary" onClick={() => onView(i.id)}>
                  Visualizar
                </Button>
              </td>
              <td className="px-3 py-2">{i.nome}</td>
              <td className="px-3 py-2">{i.cpf}</td>
              <td className="px-3 py-2">{i.telefone || "-"}</td>
              <td className="px-3 py-2">{i.status}</td>
              <td className="px-3 py-2">{new Date(i.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>
                Sem pendências
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}