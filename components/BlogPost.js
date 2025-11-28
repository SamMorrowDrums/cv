import DateFormatter from "../components/DateFormatter";
import markdownStyles from "./markdown-styles.module.css";

export default function BlogPost({ title, date, content }) {
  return (
    <article>
      <header className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary dark:text-dark-primary leading-tight mb-4 tracking-tight">
          {title}
        </h1>
        <time className="text-sm text-secondary dark:text-dark-secondary">
          <DateFormatter dateString={date} />
        </time>
      </header>
      
      <div
        className={markdownStyles["markdown"]}
        dangerouslySetInnerHTML={{ __html: content }}
      ></div>
    </article>
  );
}