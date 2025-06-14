import DateFormatter from "../components/DateFormatter";
import markdownStyles from "./markdown-styles.module.css";

export default function Experience({
  company,
  position,
  fromDate,
  toDate,
  location,
  link,
  content,
}) {
  return (
    <article className="glass-morphism backdrop-blur-md border border-white/20 rounded-2xl p-10 shadow-tech hover:shadow-tech-hover transition-all duration-500 hover:scale-[1.02] hover:border-tech-blue/40 group hover-glow">
      <header className="mb-8">
        <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight tracking-tight group-hover:text-tech-blue transition-colors duration-300 text-shadow-sm">
          <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-tech-blue group-hover:to-neon-blue">
            {position}
          </span> |{" "}
          <a 
            href={link}
            className="text-tech-blue hover:text-neon-blue transition-all duration-300 border-b-3 border-transparent hover:border-tech-blue hover:bg-tech-blue/10 px-2 py-1 rounded-lg hover:shadow-glow-sm"
          >
            {company}
          </a>
        </h3>
        <div className="text-xl text-slate-300 font-semibold bg-tech-slate/80 rounded-lg px-4 py-2 inline-block border border-white/10">
          <DateFormatter dateString={fromDate} /> – {" "}
          <DateFormatter dateString={toDate} />, <span className="text-tech-teal font-medium">{location}</span>
        </div>
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
