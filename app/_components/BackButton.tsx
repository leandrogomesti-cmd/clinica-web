'use client';
import { useRouter } from 'next/navigation';


export default function BackButton(){
const router = useRouter();
return (
<button
onClick={() => router.back()}
className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100"
aria-label="Voltar"
>
Voltar
</button>
);
}