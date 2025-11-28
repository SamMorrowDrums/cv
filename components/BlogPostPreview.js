import DateFormatter from "../components/DateFormatter";
import Link from "next/link";

export default function BlogPostPreview({ title, date, slug, excerpt }) {
  return (
    <article className="pb-8 border-b border-border dark:border-dark-border last:border-b-0 last:pb-0">
      <Link href={`/blog/${slug}`} className="group block">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary dark:text-dark-primary group-hover:text-accent dark:group-hover:text-dark-accent transition-colors duration-200 mb-2">
          {title}
        </h2>
      </Link>
      <time className="text-sm text-secondary dark:text-dark-secondary block mb-3">
        <DateFormatter dateString={date} />
      </time>
      {excerpt && (
        <p className="text-secondary dark:text-dark-secondary leading-relaxed">
          {excerpt}
        </p>
      )}
    </article>
  );
}