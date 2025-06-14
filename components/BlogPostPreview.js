import DateFormatter from "../components/DateFormatter";
import Link from "next/link";

export default function BlogPostPreview({ title, date, slug, excerpt }) {
  return (
    <article className="glass-morphism backdrop-blur-md border border-white/20 rounded-2xl p-10 shadow-tech hover:shadow-tech-hover transition-all duration-500 hover:scale-[1.02] hover:border-tech-blue/40 group hover-glow">
      <div>
        <Link href={`/blog/${slug}`} className="group/link">
          <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-4 group-hover/link:text-tech-blue transition-all duration-300 hover:bg-tech-blue/10 px-2 py-1 rounded-lg inline-block tracking-tight text-shadow-sm hover:shadow-glow-sm">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover/link:from-tech-blue group-hover/link:to-neon-blue">
              {title}
            </span>
          </h2>
        </Link>
        <time className="text-xl text-slate-300 font-semibold bg-tech-slate/80 rounded-lg px-4 py-2 inline-block mb-4 border border-white/10">
          <DateFormatter dateString={date} />
        </time>
        {excerpt && (
          <p className="text-lg text-slate-300 leading-relaxed mt-4">
            {excerpt}
          </p>
        )}
      </div>
    </article>
  );
}