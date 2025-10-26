import { Card } from "./ui/card";

const features = [
  { title: "Create posts", desc: "Write markdown posts and save as draft or publish." },
  { title: "Manage categories", desc: "Create categories and tag posts." },
  { title: "Filter & list", desc: "List posts and filter by category." }
];

export default function Features() {
  return (
    <section id="features" className="py-16 bg-slate-900/30">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-6">
        {features.map((f) => (
          <Card key={f.title}>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-slate-400">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
