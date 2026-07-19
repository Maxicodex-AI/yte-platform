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
      <nav className="bg-black border-b-2 border-yellow-500 shadow-lg sticky top-0 z-50">
        <div className="flex justify-between items-center px-6 py-2">
          <a href="/">
            <img src="/images/yte-icon.png" alt="YTE Logo" className="h-16 md:h-24 w-auto" />
          </a>

          {/* DESKTOP MENU */}
          <ul className="hidden md:flex gap-6 text-sm font-medium items-center">
            <li><a href="/about" className="text-gray-200 hover:text-yellow-400 font-semibold">About</a></li>
            <li><a href="#services" className="text-gray-200 hover:text-yellow-400 font-semibold">Services</a></li>
            <li><a href="#how-it-works" className="text-gray-200 hover:text-yellow-400 font-semibold">How it Works</a></li>
            <li><a href="/ai-assistant" className="text-gray-200 hover:text-yellow-400 font-semibold">AI Assistant</a></li>
            <li><a href="#contact" className="text-gray-200 hover:text-yellow-400 font-semibold">Contact</a></li>
            <Show when="signed-out">
              <li>
                <SignInButton>
                  <button className="text-gray-200 hover:text-yellow-400 font-semibold">Sign In</button>
                </SignInButton>
              </li>
              <li>
                <SignUpButton>
                  <button className="border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black px-4 py-2 rounded-lg font-bold transition-all">
                    Sign Up Free
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
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-yellow-400 focus:outline-none">
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
            <a href="#how-it-works" className="text-gray-200 hover:text-yellow-400 font-semibold" onClick={() => setMenuOpen(false)}>How it Works</a>
            <a href="/ai-assistant" className="text-gray-200 hover:text-yellow-400 font-semibold" onClick={() => setMenuOpen(false)}>AI Assistant</a>
            <a href="#contact" className="text-gray-200 hover:text-yellow-400 font-semibold" onClick={() => setMenuOpen(false)}>Contact</a>
            <Show when="signed-out">
              <SignInButton>
                <button className="text-gray-200 hover:text-yellow-400 font-semibold text-left">Sign In</button>
              </SignInButton>
              <SignUpButton>
                <button className="border-2 border-yellow-500 text-yellow-400 px-4 py-2 rounded-lg font-bold w-full">
                  Sign Up Free
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
      <section className="bg-gradient-to-b from-black to-gray-950 py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <img src="/images/yte-logo.png" alt="YTE Logo" className="h-32 md:h-48 w-auto mx-auto mb-8" />
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
  Find Trusted Engineers and <br />
  <span className="text-yellow-400">Technicians Near You</span>
</h1>

<p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
  Connect with verified professionals for electrical, solar, plumbing, borehole, automation, and construction projects—powered by AI.
</p>
          {/* SEARCH BAR */}
         <div className="flex gap-2 max-w-2xl mx-auto mb-6">
  <input
    placeholder="What engineering problem do you need solved?"
    className="flex-1 bg-white text-black px-5 py-4 rounded-xl outline-none text-sm font-medium"
  />

  <a
    href="/ai-assistant"
    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-4 rounded-xl transition-all whitespace-nowrap"
  >
    Get Help ⚡
  </a>
</div>

          {/* QUICK CATEGORIES */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
  "Electrical Wiring",
  "Solar Installation",
  "Borehole Repair",
  "Smart Automation",
  "Plumbing",
].map((cat, i) => (
  <a
    key={i}
    href="/ai-assistant"
    className="text-xs bg-gray-800 hover:bg-yellow-500 hover:text-black text-gray-300 px-4 py-2 rounded-full transition-all border border-gray-700"
  >
    {cat} →
  </a>
))}
          </div>

          {/* TRUST STATS */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: "100%", label: "Verified Providers" },
              { value: "AI", label: "Powered Diagnosis" },
              { value: "Fast", label: "Response Time" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-yellow-400 text-xl font-extrabold">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-white mb-3">How YTE Works</h2>
          <p className="text-gray-400 text-center mb-12">Get help in 3 simple steps</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* FOR CLIENTS */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h3 className="text-yellow-400 font-bold text-lg mb-6">🙋 For Clients</h3>
              <div className="flex flex-col gap-6">
                {[
                  { step: "1", title: "Describe Your Problem", desc: "Tell us what needs fixing. Our AI can help diagnose it instantly." },
                  { step: "2", title: "Get Matched", desc: "Verified technicians and engineers near you express interest." },
                  { step: "3", title: "Hire and Get It Done", desc: "Choose your preferred provider, track progress, and rate them after." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{item.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Show when="signed-out">
                <SignUpButton>
                  <button className="mt-6 w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-all">
                    Post a Job — It&apos;s Free
                  </button>
                </SignUpButton>
              </Show>
            </div>

            {/* FOR PROVIDERS */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h3 className="text-yellow-400 font-bold text-lg mb-6">👷 For Technicians and Engineers</h3>
              <div className="flex flex-col gap-6">
                {[
                  { step: "1", title: "Create Your Profile", desc: "Add your skills, location, and get verified by the YTE team." },
                  { step: "2", title: "Find Jobs Near You", desc: "Browse available jobs that match your skills. Express interest instantly." },
                  { step: "3", title: "Work and Get Paid", desc: "Complete jobs, earn ratings, and build your reputation on the platform." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{item.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Show when="signed-out">
                <SignUpButton>
                  <button className="mt-6 w-full border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black font-bold py-3 rounded-xl transition-all">
                    Join as a Provider
                  </button>
                </SignUpButton>
              </Show>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-white mb-3">Our Services</h2>
          <p className="text-gray-400 text-center mb-12">Expert help for every engineering need</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: "⚡", title: "Electrical and Wiring", desc: "Full house wiring, installations and maintenance.", color: "border-yellow-500" },
              { icon: "☀️", title: "Solar Solutions", desc: "Solar installation, sizing and maintenance.", color: "border-orange-500" },
              { icon: "💧", title: "Borehole and Plumbing", desc: "Borehole drilling, plumbing installations.", color: "border-blue-500" },
              { icon: "🏠", title: "Smart Automation", desc: "Smart home and industrial IoT automation.", color: "border-purple-500" },
              { icon: "💻", title: "Software and Web Dev", desc: "Full-stack web development and cloud solutions.", color: "border-green-500" },
              { icon: "🤖", title: "AI Solutions", desc: "AI-powered tools and engineering diagnostics.", color: "border-pink-500" },
            ].map((service, i) => (
              <div key={i} className={`bg-gray-900 border-t-4 ${service.color} rounded-xl p-6 hover:scale-105 transition-all cursor-pointer`}>
                <div className="text-3xl mb-3">{service.icon}</div>
                <h4 className="text-white font-bold text-sm mb-2">{service.title}</h4>
                <p className="text-gray-400 text-xs">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI ASSISTANT PROMO */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-3xl p-10">
            <h2 className="text-3xl font-extrabold text-black mb-4">
              🤖 Try Our AI Engineer Assistant
            </h2>
           <p className="text-black mb-6 text-lg">
  Describe any engineering problem and get instant diagnosis, troubleshooting steps, safety tips, and recommended YTE verified providers.
</p>

<a
  href="/ai-assistant"
  className="inline-block bg-black text-yellow-400 font-extrabold px-8 py-4 rounded-xl text-lg hover:bg-gray-900 transition-all"
>
  Try AI Assistant Free →
</a>
          </div>
        </div>
      </section>

      {/* WHY YTE */}
      <section className="py-20 px-6 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-white mb-3">Why Choose YTE?</h2>
          <p className="text-gray-400 text-center mb-12">Built for Nigeria. Powered by AI.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "✅", title: "Verified Providers", desc: "Every technician and engineer on YTE is verified with ID and credentials before they can accept jobs." },
              { icon: "🤖", title: "AI-Powered", desc: "Our AI assistant diagnoses your problem instantly and recommends the right verified professional." },
              { icon: "📍", title: "Location-Based", desc: "We match you with the nearest available provider so you get help fast." },
              { icon: "⭐", title: "Rating System", desc: "Every job gets rated. Only the best providers stay on top. You always know who you are hiring." },
              { icon: "🔒", title: "Safe and Trusted", desc: "Three-tier verification system ensures clients are protected from fake or unqualified providers." },
              { icon: "⚡", title: "Fast Response", desc: "Available providers get notified instantly when you post a job. Help is always just minutes away." },
            ].map((item, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
<section className="py-20 px-6 bg-black text-center">
  <div className="max-w-2xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
      Ready to Get Started?
    </h2>

    <p className="text-gray-400 mb-8">
      Connect with trusted engineering professionals and bring your project to life.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Show when="signed-out">
        <SignUpButton>
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold px-8 py-4 rounded-xl text-lg transition-all">
            Get Started Free →
          </button>
        </SignUpButton>
      </Show>

      <a
        href="/ai-assistant"
        className="border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black font-extrabold px-8 py-4 rounded-xl text-lg transition-all"
      >
        Try AI Assistant
      </a>
    </div>
  </div>
</section>

      {/* CONTACT */}
      <section id="contact" className="py-20 px-6 bg-gray-950 text-center">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">Get In Touch</h2>
        <p className="text-gray-400 mb-8">Have questions? We are here to help.</p>
        <div className="flex flex-col items-center gap-3 text-gray-300">
          <p>📞 08130223871</p>
          <p>📧 youngtechengineerings@gmail.com</p>
          <p>📱 @youngtechengineerings</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-yellow-900 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/images/yte-icon.png" alt="YTE" className="h-12 w-auto mb-3" />
              <p className="text-gray-500 text-xs">
                Engineering Excellence with Global Standards.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">For Clients</h4>
              <div className="flex flex-col gap-2">
                <a href="/client-dashboard" className="text-gray-500 hover:text-yellow-400 text-xs">Post a Job</a>
                <a href="/ai-assistant" className="text-gray-500 hover:text-yellow-400 text-xs">AI Assistant</a>
                <a href="#how-it-works" className="text-gray-500 hover:text-yellow-400 text-xs">How it Works</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">For Providers</h4>
              <div className="flex flex-col gap-2">
                <a href="/dashboard" className="text-gray-500 hover:text-yellow-400 text-xs">Find Jobs</a>
                <a href="/onboarding" className="text-gray-500 hover:text-yellow-400 text-xs">Join as Provider</a>
                <a href="/about" className="text-gray-500 hover:text-yellow-400 text-xs">About YTE</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Company</h4>
              <div className="flex flex-col gap-2">
                <a href="/about" className="text-gray-500 hover:text-yellow-400 text-xs">About Us</a>
                <a href="#contact" className="text-gray-500 hover:text-yellow-400 text-xs">Contact</a>
                <a href="#" className="text-gray-500 hover:text-yellow-400 text-xs">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-900 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs">© 2026 Young Technology Engineers. All rights reserved.</p>
            <p className="text-yellow-700 text-xs">Engineering Excellence • Technology Innovation • Endless Possibilities</p>
          </div>
        </div>
      </footer>

    </main>
  );
}