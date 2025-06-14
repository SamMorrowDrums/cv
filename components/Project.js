import DateFormatter from "../components/DateFormatter";
import markdownStyles from "./markdown-styles.module.css";

export default function Project({ title, link, content }) {
  return (
    <article className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-300/60 group">
      <header className="mb-8">
        <a href={link} className="group/link">
          <h3 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 leading-tight tracking-tight group-hover/link:text-purple-700 transition-all duration-300 hover:bg-purple-50/80 px-2 py-1 rounded-lg inline-block">
            {title}
          </h3>
        </a>
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
