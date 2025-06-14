import DateFormatter from "../components/DateFormatter";
import markdownStyles from "./markdown-styles.module.css";

export default function BlogPost({ title, date, content }) {
  return (
    <article className="mb-8 lg:px-16 xl:px-64">
      <div>
        <h1 className="text-4xl lg:text-6xl leading-tight mb-4">{title}</h1>
        <time className="text-xl lg:text-2xl mb-8 text-gray-400 block">
          <DateFormatter dateString={date} />
        </time>
      </div>
      <div>
        <div
          className={markdownStyles["markdown"]}
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>
      </div>
    </article>
  );
}