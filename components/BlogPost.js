import DateFormatter from "../components/DateFormatter";
import markdownStyles from "./markdown-styles.module.css";

export default function BlogPost({ title, date, content }) {
  return (
    <article className="glass-morphism-dark backdrop-blur-lg border border-white/20 rounded-3xl p-6 sm:p-12 shadow-tech mx-auto" style={{ width: '100%', maxWidth: 'min(56rem, calc(100vw - 2rem))' }}>
      <header className="mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 sm:mb-6 tracking-tight text-shadow-lg break-words">
          <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-teal bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        <time className="text-xl sm:text-2xl text-slate-300 font-semibold bg-tech-slate/80 rounded-lg px-4 sm:px-6 py-2 sm:py-3 inline-block border border-white/10">
          <DateFormatter dateString={date} />
        </time>
      </header>
      
      <div className="prose prose-lg sm:prose-xl max-w-none prose-invert">
        <div
          className={markdownStyles["markdown"]}
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>
      </div>
    </article>
  );
}