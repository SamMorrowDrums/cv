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
    <article className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <header className="mb-4">
        <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 leading-tight">
          {position} at{" "}
          <a 
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 border-b border-transparent hover:border-blue-600" 
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {company}
          </a>
        </h3>
        <div className="text-gray-600 text-base sm:text-lg">
          <DateFormatter dateString={fromDate} /> – <DateFormatter dateString={toDate} />
          {location && <span className="ml-2 text-gray-500">• {location}</span>}
        </div>
      </header>
      
      <div
        className={`${markdownStyles["markdown"]} text-gray-700`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
