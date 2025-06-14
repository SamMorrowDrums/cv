import Experience from "../components/Experience";
import Project from "../components/Project";
import {
  getAllDocuments,
  experienceDirectory,
  projectsDirectory,
} from "../lib/api";
import markdownToHtml from "../lib/markDownToHtml";
import Head from "next/head";
import Link from "next/link";

export default function Home({ experiences, projects }) {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Head>
          <title>Sam Morrow</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          {/* Header Section */}
          <header className="text-center mb-16 py-8">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Sam Morrow
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Drummer, software engineer and online-learning fanatic.
            </p>

            <nav className="flex justify-center space-x-8">
              <Link href="/blog">
                <a className="text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 border-b-2 border-transparent hover:border-blue-600 pb-1">
                  Blog
                </a>
              </Link>
              <a
                href="https://github.com/sammorrowdrums"
                rel="noopener noreferrer"
                target="_blank"
                className="text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 border-b-2 border-transparent hover:border-blue-600 pb-1"
              >
                GitHub
              </a>
            </nav>
          </header>

          {/* Experience Section */}
          <section className="mb-16">
            <div className="border-t border-gray-200 pt-12">
              <a id="experience" href="#experience" className="group">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 group-hover:text-gray-700 transition-colors duration-200">
                  Experience
                </h2>
              </a>
              <div className="space-y-12">
                {experiences.map((exp) => (
                  <Experience key={exp.fromDate} {...exp} />
                ))}
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section className="mb-16">
            <div className="border-t border-gray-200 pt-12">
              <a id="projects" href="#projects" className="group">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 group-hover:text-gray-700 transition-colors duration-200">
                  Projects
                </h2>
              </a>
              <div className="space-y-12">
                {projects.map((proj) => (
                  <Project key={proj.fromDate} {...proj} />
                ))}
              </div>
            </div>
          </section>
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
