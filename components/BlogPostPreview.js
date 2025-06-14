import DateFormatter from "../components/DateFormatter";
import Link from "next/link";

export default function BlogPostPreview({ title, date, slug, excerpt }) {
  return (
    <article className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div>
        <Link href={`/blog/${slug}`}>
          <a className="group">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors duration-200">
              {title}
            </h2>
          </a>
        </Link>
        <time className="text-lg text-gray-600 font-medium block mb-4">
          <DateFormatter dateString={date} />
        </time>
      </div>
    </article>
  );
}