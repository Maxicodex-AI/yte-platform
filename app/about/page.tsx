export default function About() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* NAV */}
      <nav className="flex justify-between items-center px-6 py-2 bg-black border-b-2 border-yellow-500 shadow-lg">
        <a href="/">
          <img
            src="/images/yte-icon.png"
            alt="YTE Logo"
            className="h-16 w-auto"
          />
        </a>
        <a href="/" className="text-gray-400 hover:text-yellow-400 text-sm font-semibold">← Back to Home</a>
      </nav>

      {/* HERO */}
      <section className="text-center py-20 px-6 bg-gradient-to-b from-black to-gray-950">
        <h1 className="text-4xl font-extrabold text-yellow-400 mb-4">About YTE</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Young Technology Engineers is building Africa&apos;s engineering and technology ecosystem — 
          connecting skilled technicians, AI-powered solutions, and customers who need real engineering help.
        </p>
      </section>

      {/* MISSION / VISION */}
      <section className="py-16 px-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-gray-800 hover:border-yellow-500 rounded-xl p-8 transition-all">
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">🎯 Our Mission</h2>
          <p className="text-gray-400">
            To make quality engineering and technical help accessible, fast, and reliable — 
            powered by skilled technicians and artificial intelligence.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 hover:border-yellow-500 rounded-xl p-8 transition-all">
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">🚀 Our Vision</h2>
          <p className="text-gray-400">
            To become Africa&apos;s leading engineering and technology ecosystem — empowering 
            technicians, engineers, students, and businesses.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 px-8 bg-black">
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-10">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: "⚡", title: "Reliability", desc: "We connect people to real, vetted technical help." },
            { icon: "🤝", title: "Empowerment", desc: "We create jobs and opportunities for technicians." },
            { icon: "🧠", title: "Innovation", desc: "We use AI to solve real engineering problems faster." },
          ].map((value, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 hover:border-yellow-500 rounded-xl p-6 text-center transition-all">
              <div className="text-3xl mb-3">{value.icon}</div>
              <h3 className="font-bold text-white mb-2">{value.title}</h3>
              <p className="text-gray-400 text-sm">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TAGLINE */}
      <section className="py-16 px-8 text-center bg-gray-950">
        <p className="text-yellow-500 text-sm font-medium tracking-widest uppercase">
          Engineering Excellence • Technology Innovation • Endless Possibilities
        </p>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 bg-black text-gray-600 text-sm border-t border-yellow-900">
        © 2026 Young Technology Engineers. All rights reserved.
      </footer>

    </main>
  );
}