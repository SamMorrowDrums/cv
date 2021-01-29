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
    <section>
      <div className="mb-8 md:mb-16"></div>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="mb-4 text-4xl lg:text-6xl leading-tight">
            <a className="hover:underline">{company}</a>
          </h3>
          <p>{position}</p>
          <div className="mb-4 md:mb-0 text-lg">
            <DateFormatter dateString={fromDate} /> -{" "}
            <DateFormatter dateString={toDate} />
          </div>
        </div>
        <div>
          <p className="text-lg leading-relaxed mb-4">{content}</p>
        </div>
      </div>
    </section>
  );
}
