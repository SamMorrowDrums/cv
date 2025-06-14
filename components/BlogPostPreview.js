import DateFormatter from "../components/DateFormatter";
import Link from "next/link";

export default function BlogPostPreview({ title, date, slug, excerpt }) {
  return (
    <article className="mb-8 lg:px-16 xl:px-64">
      <div>
        <Link href={`/blog/${slug}`}>
          <a>
            <h2 className="text-2xl lg:text-4xl leading-tight hover:underline">{title}</h2>
          </a>
        </Link>
        <time className="text-xl lg:text-2xl mb-4 text-gray-400 block">
          <DateFormatter dateString={date} />
        </time>
      </div>
    </article>
  );
}