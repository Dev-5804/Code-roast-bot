import Link from 'next/link';
import { Github, Terminal } from 'lucide-react';

export default function Header() {
    return (
        <header className="border-b border-[#4a4e69] bg-[#1b1b2f] shrink-0">
            <div className="max-w-full mx-auto flex items-center justify-between h-14 px-5">

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 bg-[#22223b] border border-[#4a4e69] rounded-md">
                        <Terminal className="w-3.5 h-3.5 text-[#c9ada7]" />
                    </div>
                    <span className="text-sm font-bold text-[#f2e9e4] tracking-tight">Code Roast</span>
                    <span className="text-[10px] font-semibold text-[#9a8c98] bg-[#22223b] border border-[#4a4e69] px-2 py-0.5 rounded-full">
                        beta
                    </span>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#9a8c98]">
                        <span
                            className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"
                            style={{ boxShadow: '0 0 6px #3fb950' }}
                        />
                        AI Powered
                    </span>
                    <div className="w-px h-4 bg-[#4a4e69] hidden sm:block" />
                    <Link
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[#9a8c98] hover:text-[#f2e9e4] transition-colors text-xs"
                    >
                        <Github className="w-4 h-4" />
                        <span className="hidden sm:inline">GitHub</span>
                    </Link>
                </div>

            </div>
        </header>
    );
}
