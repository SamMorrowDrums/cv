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
    <article className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-300/60 group">
      <header className="mb-8">
        <h3 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 leading-tight tracking-tight group-hover:text-blue-700 transition-colors duration-300">
          {position} |{" "}
          <a 
            href={link}
            className="text-blue-700 hover:text-blue-900 transition-all duration-300 border-b-3 border-transparent hover:border-blue-700 hover:bg-blue-50/80 px-2 py-1 rounded-lg"
          >
            {company}
          </a>
        </h3>
        <div className="text-xl text-slate-600 font-semibold bg-slate-100/80 rounded-lg px-4 py-2 inline-block">
          <DateFormatter dateString={fromDate} /> – {" "}
          <DateFormatter dateString={toDate} />, <span className="text-slate-500 font-medium">{location}</span>
        </div>
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
