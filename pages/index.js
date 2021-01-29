import Experience from "../components/Experience";
import { getAllExperiences } from "../lib/api";
import Head from "next/head";

export default function Home({ experiences }) {
  return (
    <div className="bg-gray-100 min-h-screen pb-32 px-4 sm:px-16">
      <div class="container mx-auto font-sans">
        <Head>
          <title>Sam Morrow</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="grid">
          <h1 className="text-6xl md:text-8xl place-self-center mt-16">
            Sam Morrow
          </h1>

          <p className="text-xl md:text-2xl place-self-center italic">
            Drummer, software engineer and online-learning fanatic.
          </p>

          <section className="place-self-center mt-4 mb-20">
            <ul className="text-xl md:text-2xl text-blue-500">
              <li className="inline mx-4">
                <a
                  href="https://sammorrowdrums.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Blog
                </a>
              </li>
              <li className="inline mx-4">
                <a
                  href="https://github.com/sammorrowdrums"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Github
                </a>
              </li>
            </ul>
          </section>
          <div className="border-t pt-8">
            {experiences.map((exp) => (
              <Experience key={exp.fromDate} {...exp} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const experiences = getAllExperiences([
    "company",
    "position",
    "fromDate",
    "toDate",
    "location",
    "link",
    "content",
  ]);

  return {
    props: { experiences },
  };
}
