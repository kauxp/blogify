import Link from "next/link";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-transparent">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold">Blogify</div>
        <div className="text-sm text-slate-400 hidden md:block">Clean blogging platform</div>
      </div>

      <nav className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost">Home</Button>
        </Link>
        <Link href="#features">
          <Button variant="ghost">Features</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Dashboard</Button>
        </Link>
      </nav>
    </header>
  );
}
