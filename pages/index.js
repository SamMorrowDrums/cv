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
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Head>
          <title>Sam Morrow</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          {/* Header Section */}
          <header className="text-center mb-20 py-12 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight">
              Sam Morrow
            </h1>

            <p className="text-2xl md:text-3xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
              Drummer, software engineer and online-learning fanatic.
            </p>

            <nav className="flex justify-center space-x-12">
              <Link href="/blog">
                <a className="text-xl font-semibold text-blue-700 hover:text-blue-900 transition-all duration-300 border-b-3 border-transparent hover:border-blue-700 pb-2 px-4 py-2 rounded-lg hover:bg-blue-50/80 transform hover:scale-105">
                  Blog
                </a>
              </Link>
              <a
                href="https://github.com/sammorrowdrums"
                rel="noopener noreferrer"
                target="_blank"
                className="text-xl font-semibold text-blue-700 hover:text-blue-900 transition-all duration-300 border-b-3 border-transparent hover:border-blue-700 pb-2 px-4 py-2 rounded-lg hover:bg-blue-50/80 transform hover:scale-105"
              >
                GitHub
              </a>
            </nav>
          </header>

          {/* Experience Section */}
          <section className="mb-20">
            <div className="gradient-border-t bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 pt-16 pb-12 px-8">
              <a id="experience" href="#experience" className="group">
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-16 group-hover:text-blue-700 transition-all duration-300 text-center tracking-tight">
                  Experience
                </h2>
              </a>
              <div className="space-y-16">
                {experiences.map((exp) => (
                  <Experience key={exp.fromDate} {...exp} />
                ))}
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section className="mb-20">
            <div className="gradient-border-t-purple bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 pt-16 pb-12 px-8">
              <a id="projects" href="#projects" className="group">
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-16 group-hover:text-purple-700 transition-all duration-300 text-center tracking-tight">
                  Projects
                </h2>
              </a>
              <div className="space-y-16">
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
