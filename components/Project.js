import DateFormatter from "../components/DateFormatter";
import markdownStyles from "./markdown-styles.module.css";

export default function Project({ title, link, content }) {
  return (
    <article className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <header className="mb-4">
        <a 
          className="group" 
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h3 className="text-2xl sm:text-3xl font-semibold text-blue-600 group-hover:text-blue-800 transition-colors duration-200 border-b border-transparent group-hover:border-blue-600 inline-block leading-tight">
            {title}
          </h3>
        </a>
      </header>
      
      <div
        className={`${markdownStyles["markdown"]} text-gray-700`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
