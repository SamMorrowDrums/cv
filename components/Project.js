import DateFormatter from "../components/DateFormatter";
import markdownStyles from "./markdown-styles.module.css";

export default function Project({ title, link, content }) {
  return (
    <article className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
      <header className="mb-6">
        <a href={link} className="group">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors duration-200">
            {title}
          </h3>
        </a>
      </header>
      
      <div className="prose prose-lg max-w-none">
        <div
          className={markdownStyles["markdown"]}
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>
      </div>
    </article>
  );
}
