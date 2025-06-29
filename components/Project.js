import DateFormatter from "../components/DateFormatter";
import markdownStyles from "./markdown-styles.module.css";

export default function Project({ title, link, content }) {
  return (
    <article className="glass-morphism backdrop-blur-md border border-white/20 rounded-2xl p-10 shadow-tech hover:shadow-tech-hover transition-all duration-500 hover:scale-[1.02] hover:border-tech-purple/40 group hover-glow">
      <header className="mb-8">
        <a href={link} className="group/link">
          <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight tracking-tight group-hover/link:text-tech-purple transition-all duration-300 hover:bg-tech-purple/10 px-2 py-1 rounded-lg inline-block text-shadow-sm hover:shadow-glow-purple">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover/link:from-tech-purple group-hover/link:to-neon-purple">
              {title}
            </span>
          </h3>
        </a>
      </header>
      
      <div className="prose prose-xl max-w-none prose-invert">
        <div
          className={markdownStyles["markdown"]}
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>
      </div>
    </article>
  );
}
