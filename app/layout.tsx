import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Pedacinho do Céu | Seu açaí, seu jeitinho',description:'Monte seu açaí com seus complementos favoritos e peça para entrega. Pedacinho do Céu.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>;}
