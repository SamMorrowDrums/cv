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
    <article className="cyber-card backdrop-blur-md border border-white/20 rounded-2xl p-10 shadow-multi-glow hover:shadow-electric transition-all duration-500 hover:scale-[1.03] hover:border-hot-pink/40 group hover-electric animate-scale-pulse energy-pulse">
      <header className="mb-8">
        <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight tracking-tight group-hover:text-tech-blue transition-colors duration-300 text-shadow-sm neon-text animate-float-bounce">
          <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-electric-lime group-hover:to-hot-pink rainbow-text">
            {position}
          </span> |{" "}
          <a 
            href={link}
            className="text-tech-blue hover:text-neon-blue transition-all duration-300 border-b-3 border-transparent hover:border-tech-blue hover:bg-tech-blue/10 px-2 py-1 rounded-lg hover:shadow-cyber-glow electric-text animate-wiggle"
          >
            {company}
          </a>
        </h3>
        <div className="text-xl text-slate-300 font-semibold bg-tech-slate/80 rounded-lg px-4 py-2 inline-block border border-white/10 shadow-voltage animate-wave cyber-card">
          <DateFormatter dateString={fromDate} /> – {" "}
          <DateFormatter dateString={toDate} />, <span className="text-tech-teal font-medium electric-text strobe">{location}</span>
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
