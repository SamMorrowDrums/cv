import DateFormatter from "../components/DateFormatter";
import markdownStyles from "./markdown-styles.module.css";

export default function BlogPost({ title, date, content }) {
  return (
    <article className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 shadow-xl max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
          {title}
        </h1>
        <time className="text-2xl text-slate-600 font-semibold bg-slate-100/80 rounded-lg px-6 py-3 inline-block">
          <DateFormatter dateString={date} />
        </time>
      </header>
      
      <div className="prose prose-xl max-w-none prose-slate">
        <div
          className={markdownStyles["markdown"]}
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>
      </div>
    </article>
  );
}