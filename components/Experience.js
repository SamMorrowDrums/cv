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
    <article className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
      <header className="mb-6">
        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
          {position} |{" "}
          <a 
            href={link}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 border-b-2 border-transparent hover:border-blue-600"
          >
            {company}
          </a>
        </h3>
        <div className="text-lg text-gray-600 font-medium">
          <DateFormatter dateString={fromDate} /> – {" "}
          <DateFormatter dateString={toDate} />, <span className="text-gray-500">{location}</span>
        </div>
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
