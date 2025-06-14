import DateFormatter from "../components/DateFormatter";
import Link from "next/link";

export default function BlogPostPreview({ title, date, slug, excerpt }) {
  return (
    <article className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-300/60 group">
      <div>
        <Link href={`/blog/${slug}`}>
          <a className="group/link">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight mb-4 group-hover/link:text-blue-700 transition-all duration-300 hover:bg-blue-50/80 px-2 py-1 rounded-lg inline-block tracking-tight">
              {title}
            </h2>
          </a>
        </Link>
        <time className="text-xl text-slate-600 font-semibold bg-slate-100/80 rounded-lg px-4 py-2 inline-block mb-4">
          <DateFormatter dateString={date} />
        </time>
        {excerpt && (
          <p className="text-lg text-slate-700 leading-relaxed mt-4">
            {excerpt}
          </p>
        )}
      </div>
    </article>
  );
}