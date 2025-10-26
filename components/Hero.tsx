export default function Hero() {
  return (
    <section className="py-24 text-center px-6">
      <h1 className="text-5xl font-extrabold mb-4">Write. Publish. Repeat.</h1>
      <p className="max-w-2xl mx-auto text-slate-400 mb-6">
        A simple multi-user blog platform scaffold built with Next.js, Supabase, Drizzle and tRPC.
      </p>

      <div className="flex items-center justify-center gap-4">
        <a href="#features" className="inline-block px-6 py-3 rounded-md bg-sky-600 text-white">See Features</a>
        <a href="/dashboard" className="inline-block px-6 py-3 rounded-md border border-slate-700 text-slate-100">Dashboard</a>
      </div>
    </section>
  );
}
