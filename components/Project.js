import DateFormatter from "../components/DateFormatter";
import markdownStyles from "./markdown-styles.module.css";

export default function Project({ title, link, content }) {
  return (
    <section className="mb-8 lg:px-16 xl:px-64">
      <div>
        <a className="hover:underline" href={link}>
          <h3 className="text-2xl lg:text-4xl leading-tight">{title}</h3>
        </a>
      </div>
      <div>
        <div
          className={markdownStyles["markdown"]}
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>
      </div>
    </section>
  );
}
