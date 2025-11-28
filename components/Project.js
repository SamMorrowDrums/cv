import markdownStyles from "./markdown-styles.module.css";

export default function Project({ title, link, content }) {
  return (
    <article className="pb-8 border-b border-border dark:border-dark-border last:border-b-0 last:pb-0">
      <header className="mb-4">
        <a href={link}>
          <h3 className="text-xl font-semibold text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover transition-colors duration-200">
            {title} →
          </h3>
        </a>
      </header>
      
      <div
        className={markdownStyles["markdown"]}
        dangerouslySetInnerHTML={{ __html: content }}
      ></div>
    </article>
  );
}
