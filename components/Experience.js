import DateFormatter from "../components/DateFormatter";

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
    <section className="mb-8 lg:px-16 xl:px-64">
      <div>
        <h3 className="text-2xl lg:text-4xl leading-tight">
          {position} -{" "}
          <a className="hover:underline" href={link}>
            {company}
          </a>{" "}
        </h3>
        <h4 className="text-xl lg:text-2xl mb-4 text-gray-400">
          <DateFormatter dateString={fromDate} /> -{" "}
          <DateFormatter dateString={toDate} />
        </h4>

        <div className="mb-4 md:mb-0 text-lg"></div>
      </div>
      <div>
        <p className="text-lg leading-relaxed mb-4">{content}</p>
      </div>
    </section>
  );
}
