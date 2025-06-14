import DateFormatter from "../components/DateFormatter";
import markdownStyles from "./markdown-styles.module.css";

export default function BlogPost({ title, date, content }) {
  return (
    <article className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm">
      <header className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
          {title}
        </h1>
        <time className="text-lg text-gray-600 font-medium block">
          <DateFormatter dateString={date} />
        </time>
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