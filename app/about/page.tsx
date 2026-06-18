export default function About() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      
      {/* NAV */}
      <nav className="flex justify-between items-center px-8 py-5 bg-gray-900 border-b border-green-500">
        <a href="/" className="text-2xl font-bold text-green-400">⚡ YTE</a>
        <a href="/" className="text-gray-400 hover:text-green-400 text-sm">← Back to Home</a>
      </nav>

      {/* HERO */}
      <section className="text-center py-20 px-6 bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-4xl font-extrabold text-green-400 mb-4">About YTE</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Young Technology Engineers is building Africa&apos;s engineering and technology ecosystem — 
          connecting skilled technicians, AI-powered solutions, and customers who need real engineering help.
        </p>
      </section>

      {/* MISSION / VISION */}
      <section className="py-16 px-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-green-400 mb-3">🎯 Our Mission</h2>
          <p className="text-gray-400">
            To make quality engineering and technical help accessible, fast, and reliable — 
            powered by skilled technicians and artificial intelligence.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-green-400 mb-3">🚀 Our Vision</h2>
          <p className="text-gray-400">
            To become Africa&apos;s leading engineering and technology ecosystem — empowering 
            technicians, engineers, students, and businesses.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 px-8 bg-gray-900">
        <h2 className="text-3xl font-bold text-center text-green-400 mb-10">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: "⚡", title: "Reliability", desc: "We connect people to real, vetted technical help." },
            { icon: "🤝", title: "Empowerment", desc: "We create jobs and opportunities for technicians." },
            { icon: "🧠", title: "Innovation", desc: "We use AI to solve real engineering problems faster." },
          ].map((value, i) => (
            <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">{value.icon}</div>
              <h3 className="font-bold text-white mb-2">{value.title}</h3>
              <p className="text-gray-400 text-sm">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 bg-gray-950 text-gray-600 text-sm border-t border-gray-800">
        © 2025 Young Technology Engineers. All rights reserved.
      </footer>

    </main>
  );
}