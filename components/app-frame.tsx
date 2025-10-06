// components/app-frame.tsx
}


export function AppFrame({ children }: { children: React.ReactNode }) {
const pathname = usePathname()
const router = useRouter()


async function signOut() {
await supabase.auth.signOut()
router.push('/login')
}


if (isPublic(pathname)) {
// Layout simples para páginas públicas
return (
<div className="p-4 md:p-6 space-y-6">
<div className="k-accent-bar" />
{children}
</div>
)
}


// Layout com sidebar para áreas internas
return (
<div className="p-4 md:p-6 space-y-4">
<div className="rounded-2xl border p-3 shadow-sm flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent">
<div className="flex items-center gap-3">
<BrandLogo />
<Separator orientation="vertical" className="h-6" />
<div className="relative hidden sm:block">
<Input placeholder="Buscar…" className="w-[260px] pl-3" />
</div>
</div>
<div className="flex items-center gap-2">
<Button variant="outline" size="sm" onClick={signOut}>Sair</Button>
</div>
</div>


<div className="min-h-[80vh] grid md:grid-cols-[220px_1fr] gap-4">
<aside className="hidden md:flex flex-col gap-1 rounded-2xl border p-3 bg-gradient-to-b from-blue-50/60 to-transparent sticky top-4 h-fit">
<nav className="flex flex-col text-sm">
<Link className="px-3 py-2 rounded-xl hover:bg-blue-50" href="/dashboard">Dashboard</Link>
<Link className="px-3 py-2 rounded-xl hover:bg-blue-50" href="/cadastro">Cadastro</Link>
<Link className="px-3 py-2 rounded-xl hover:bg-blue-50" href="/secretaria">Aprovação de Cadastro</Link>
<Link className="px-3 py-2 rounded-xl hover:bg-blue-50" href="/pacientes">Pacientes</Link>
<Link className="px-3 py-2 rounded-xl hover:bg-blue-50" href="/agenda">Agenda</Link>
<Link className="px-3 py-2 rounded-xl hover:bg-blue-50" href="/financeiro">Financeiro</Link>
</nav>
</aside>
<main className="space-y-6">{children}</main>
</div>
</div>
)
}