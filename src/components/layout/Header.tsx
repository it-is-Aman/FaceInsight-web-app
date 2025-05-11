"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button"

import { Menu, X, Home, Upload } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const menuItems = [
        { text: "Home", icon: <Home className="h-4 w-4 mr-2" />, path: "/" },
        { text: "Upload", icon: <Upload className="h-4 w-4 mr-2" />, path: "/upload" },
        // { text: "Results", icon: <FileText className="h-4 w-4 mr-2" />, path: "/results" },
        // { text: "History", icon: <History className="h-4 w-4 mr-2" />, path: "/history" },
    ];

    return (
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-sm transition-all duration-200">
            <div className="container h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="flex items-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        onClick={closeMenu}
                    >
                        <span className="bg-primary text-primary-foreground h-9 w-9 rounded-full flex items-center justify-center mr-2 shadow-sm">
                            <span className="font-serif text-lg font-semibold">F</span>
                        </span>
                        <span className="font-serif font-medium text-lg md:text-xl">
                            FaceInsight<span className="text-primary font-bold">AI</span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.text}
                            href={item.path}
                            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                            {item.icon}
                            {item.text}
                        </Link>
                    ))}
                    <SignedOut>
                        <Button asChild size="default" variant={"outline"} className="bg-primary text-primary-foreground hover:bg-primary/70">
                            <SignInButton />
                        </Button>
                        <Button asChild size="default" variant={"outline"} className="bg-primary text-primary-foreground hover:bg-primary/70">
                            <SignUpButton />
                        </Button>
                    </SignedOut>
                    <SignedIn>
                        <Button asChild size="default" variant={"outline"} className="bg-primary text-primary-foreground hover:bg-primary/70">
                            <UserButton />
                        </Button>
                    </SignedIn>
                </nav>

                {/* Mobile Navigation Toggle */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden flex items-center justify-center h-10 w-10 rounded-md border border-input bg-background"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-16 inset-x-0 bg-background border-b border-border shadow-md animate-fade-in">
                        <nav className="container py-4">
                            <ul className="flex flex-col space-y-4">
                                {menuItems.map((item) => (
                                    <li key={item.text}>
                                        <Link
                                            href={item.path}
                                            className="flex items-center py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                                            onClick={closeMenu}
                                        >
                                            {item.icon}
                                            {item.text}
                                        </Link>
                                    </li>
                                ))}
                                <li className=" flex items-center justify-evenly">
                                    <SignedOut>
                                        <Button asChild size="default" variant={"outline"} onClick={closeMenu} className="bg-primary text-primary-foreground hover:bg-primary/75">
                                            <SignInButton />
                                        </Button>
                                        <Button asChild size="default" variant={"outline"} onClick={closeMenu} className="bg-primary text-primary-foreground hover:bg-primary/75">
                                            <SignUpButton />
                                        </Button>
                                    </SignedOut>
                                    <SignedIn>
                                        <Button asChild size="default" variant={"outline"} onClick={closeMenu} className="bg-primary text-primary-foreground hover:bg-primary/75">
                                            <UserButton />
                                        </Button>
                                    </SignedIn>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
