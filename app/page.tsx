import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import WelcomeBanner from "./WelcomeBanner";
import DashboardLink from "./DashboardLink";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <WelcomeBanner />
      
    {/* NAVBAR */}
    <nav className="flex justify-between items-center px-8 py-2 bg-black border-b-2 border-yellow-500 shadow-lg">
      <a href="/">
        <img
          src="/images/yte-icon.png"
          alt="YTE Logo"
          className="h-30 w-auto"
        />
      </a>
      <ul className="flex gap-6 text-sm font-medium items-center">
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
          <li>
            <DashboardLink />
          </li>
          <li><UserButton /></li>
        </Show>
      </ul>
    </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center py-32 px-6 bg-gradient-to-b from-black to-gray-950">
        <img
          src="/images/yte-logo.png"
          alt="YTE Logo"
          className="h-59 w-auto mb-8"
        />
        <h2 className="text-5xl font-extrabold text-white leading-tight mb-4">
          Engineering the <span className="text-yellow-400">Future</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mb-4">
          Young Technology Engineers — Your trusted partner for electrical, solar, automation, 
          software, and AI-powered engineering solutions.
        </p>
        <p className="text-yellow-500 text-sm font-medium mb-8 tracking-widest uppercase">
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
      <section id="services" className="py-20 px-8 bg-gray-950">
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
      <section id="contact" className="py-20 px-8 bg-black text-center">
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