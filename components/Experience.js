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
    <article className="pb-8 border-b border-border dark:border-dark-border last:border-b-0 last:pb-0">
      <header className="mb-4">
        <h3 className="text-xl font-semibold text-primary dark:text-dark-primary mb-1">
          {position}{" "}
          <span className="text-secondary dark:text-dark-secondary font-normal">at</span>{" "}
          <a 
            href={link}
            className="text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover transition-colors duration-200"
          >
            {company}
          </a>
        </h3>
        <div className="text-sm text-secondary dark:text-dark-secondary">
          <DateFormatter dateString={fromDate} /> – <DateFormatter dateString={toDate} /> · {location}
        </div>
      </header>
      
      <div
        className={markdownStyles["markdown"]}
        dangerouslySetInnerHTML={{ __html: content }}
      ></div>
    </article>
  );
}
