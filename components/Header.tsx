import Link from 'next/link';
import { Github } from 'lucide-react';

export default function Header() {
    return (
        <header className="border-b border-[#e5e7eb] bg-white">
            <div className="max-w-[1100px] mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
                <h1 className="text-xl font-bold tracking-tight">Code Roast</h1>
                <nav>
                    <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors">
                        <Github className="w-5 h-5" />
                        <span className="sr-only">GitHub</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
