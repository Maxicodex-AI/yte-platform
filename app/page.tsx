"use client";
import { useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import WelcomeBanner from "./WelcomeBanner";
import DashboardLink from "./DashboardLink";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <WelcomeBanner />
      
    {/* NAVBAR */}
    <nav className="bg-black border-b-2 border-yellow-500 shadow-lg">
      <div className="flex justify-between items-center px-6 py-2">
        {/* LOGO */}
        <a href="/">
          <img
            src="/images/yte-icon.png"
            alt="YTE Logo"
            className="h-16 md:h-24 w-auto"
          />
        </a>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex gap-6 text-sm font-medium items-center">
          <li><a href="/about" className="text-gray-200 hover:text-yellow-400 font-semibold">About</a></li>
          <li><a href="#services" className="text-gray-200 hover:text-yellow-400 font-semibold">Services</a></li>
          <li><a href="/ai-assistant" className="text-gray-200 hover:text-yellow-400 font-semibold">AI Assistant</a></li>
          <li><a href="#contact" className="text-gray-200 hover:text-yellow-400 font-semibold">Contact</a></li>
          <li>
            <a href="/ai-assistant" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg transition-all">
              Try AI Assistant
            </a>
          </li>
          <Show when="signed-out">
            <li>
              <SignInButton>
                <button className="text-gray-200 hover:text-yellow-400 font-semibold">Sign In</button>
              </SignInButton>
            </li>
            <li>
              <SignUpButton>
                <button className="border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black px-4 py-2 rounded-lg font-bold transition-all">
                  Sign Up
                </button>
              </SignUpButton>
            </li>
          </Show>
          <Show when="signed-in">
            <li><DashboardLink /></li>
            <li><UserButton /></li>
          </Show>
        </ul>

        {/* MOBILE RIGHT SIDE */}
        <div className="flex items-center gap-3 md:hidden">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-yellow-400 focus:outline-none"
          >
            {menuOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-yellow-900 px-6 py-4 flex flex-col gap-4">
          <a href="/about" className="text-gray-200 hover:text-yellow-400 font-semibold" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#services" className="text-gray-200 hover:text-yellow-400 font-semibold" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="/ai-assistant" className="text-gray-200 hover:text-yellow-400 font-semibold" onClick={() => setMenuOpen(false)}>AI Assistant</a>
          <a href="#contact" className="text-gray-200 hover:text-yellow-400 font-semibold" onClick={() => setMenuOpen(false)}>Contact</a>
          <a href="/ai-assistant" className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg text-center" onClick={() => setMenuOpen(false)}>
            Try AI Assistant
          </a>
          <Show when="signed-out">
            <SignInButton>
              <button className="text-gray-200 hover:text-yellow-400 font-semibold text-left">Sign In</button>
            </SignInButton>
            <SignUpButton>
              <button className="border-2 border-yellow-500 text-yellow-400 px-4 py-2 rounded-lg font-bold w-full">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <DashboardLink />
          </Show>
        </div>
      )}
    </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center py-20 md:py-32 px-6 bg-gradient-to-b from-black to-gray-950">
        <img
          src="/images/yte-logo.png"
          alt="YTE Logo"
          className="h-40 md:h-56 w-auto mb-8"
        />
        <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
          Engineering the <span className="text-yellow-400">Future</span>
        </h2>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mb-4">
          Young Technology Engineers — Your trusted partner for electrical, solar, automation, 
          software, and AI-powered engineering solutions.
        </p>
        <p className="text-yellow-500 text-xs md:text-sm font-medium mb-8 tracking-widest uppercase">
          Engineering Excellence • Technology Innovation • Endless Possibilities
        </p>
        <div className="flex gap-4">
          <a href="#services" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg">
            Our Services
          </a>
          <a href="#contact" className="border border-yellow-500 hover:bg-yellow-500 hover:text-black text-yellow-400 font-bold px-6 py-3 rounded-lg">
            Contact Us
          </a>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 px-6 md:px-8 bg-gray-950">
        <h3 className="text-3xl font-bold text-center text-yellow-400 mb-12">What We Do</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { icon: "⚡", title: "Electrical & Wiring", desc: "Full house wiring, installations and maintenance." },
            { icon: "☀️", title: "Solar Solutions", desc: "Solar installation, sizing and maintenance." },
            { icon: "💧", title: "Borehole & Plumbing", desc: "Borehole drilling, plumbing installations." },
            { icon: "🏠", title: "Smart Automation", desc: "Smart home and industrial IoT automation." },
            { icon: "💻", title: "Software & Web Dev", desc: "Full-stack web development and cloud solutions." },
            { icon: "🤖", title: "AI Solutions", desc: "AI-powered tools and engineering diagnostics." },
          ].map((service, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 hover:border-yellow-500 rounded-xl p-6 transition-all">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">{service.title}</h4>
              <p className="text-gray-400 text-sm">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 px-6 md:px-8 bg-black text-center">
        <h3 className="text-3xl font-bold text-yellow-400 mb-4">Get In Touch</h3>
        <p className="text-gray-400 mb-8">Ready to start your project? Contact us today.</p>
        <div className="flex flex-col items-center gap-3 text-gray-300">
          <p>📞 08130223871</p>
          <p>📧 youngtechengineerings@gmail.com</p>
          <p>📱 @youngtechengineerings</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 bg-black text-gray-600 text-sm border-t border-yellow-900">
        © 2026 Young Technology Engineers. All rights reserved.
      </footer>

    </main>
  );
}