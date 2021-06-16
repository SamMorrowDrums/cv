import Experience from "../components/Experience";
import Project from "../components/Project";
import {
  getAllDocuments,
  experienceDirectory,
  projectsDirectory,
} from "../lib/api";
import markdownToHtml from "../lib/markDownToHtml";
import Head from "next/head";

export default function Home({ experiences, projects }) {
  return (
    <div className="bg-gray-100 min-h-screen pb-32 px-4 sm:px-16">
      <div className="container mx-auto font-sans">
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
                  GitHub
                </a>
              </li>
            </ul>
          </section>
          <div className="border-t pt-8">
            <a id="experience" href="#experience">
              <h2 className="text-6xl text-gray-700 mb-8 lg:px-16 xl:px-64">
                Experience
              </h2>
            </a>
            {experiences.map((exp) => (
              <Experience key={exp.fromDate} {...exp} />
            ))}
          </div>

          <div className="border-t pt-8">
            <a id="projects" href="#projects">
              <h2 className="text-6xl text-gray-700 mb-8 lg:px-16 xl:px-64">
                Projects
              </h2>
            </a>
            {projects.map((proj) => (
              <Project key={proj.fromDate} {...proj} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const exp = await getAllDocuments(experienceDirectory);
  const experiences = [];
  const proj = await getAllDocuments(projectsDirectory);
  const projects = [];

  for (let i = 0; i < exp.length; i++) {
    const content = await markdownToHtml(exp[i].content || "");
    experiences.push({ ...exp[i], content });
  }

  for (let i = 0; i < proj.length; i++) {
    const content = await markdownToHtml(proj[i].content || "");
    projects.push({ ...proj[i], content });
  }

  return {
    props: { experiences, projects },
  };
}
