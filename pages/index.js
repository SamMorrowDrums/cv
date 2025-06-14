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
    <div className="bg-gradient-to-br from-tech-dark via-slate-900 to-tech-slate min-h-screen relative overflow-hidden">
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-tech-blue rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-tech-purple rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-40 w-56 h-56 bg-tech-teal rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <Head>
          <title>Sam Morrow</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          {/* Header Section */}
          <header className="text-center mb-20 py-16 glass-morphism-dark rounded-3xl shadow-tech hover:shadow-tech-hover transition-all duration-500 border border-white/10 animate-slide-up">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight glow-text-lg text-shadow-lg">
              <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-teal bg-clip-text text-transparent">
                Sam Morrow
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Drummer, <span className="text-tech-blue font-semibold">software engineer</span> and <span className="text-tech-teal font-semibold">online-learning fanatic</span>.
            </p>

            <nav className="flex justify-center space-x-8">
              <Link href="/blog">
                <a className="group relative px-8 py-4 text-xl font-semibold text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-tech-blue to-tech-purple hover:from-neon-blue hover:to-neon-purple transform hover:scale-105 hover:shadow-glow-md">
                  <span className="relative z-10">Blog</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-tech-blue to-tech-purple rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                </a>
              </Link>
              <a
                href="https://github.com/sammorrowdrums"
                rel="noopener noreferrer"
                target="_blank"
                className="group relative px-8 py-4 text-xl font-semibold text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-tech-teal to-tech-emerald hover:from-neon-teal hover:to-tech-emerald transform hover:scale-105 hover:shadow-glow-md"
              >
                <span className="relative z-10">GitHub</span>
                <div className="absolute inset-0 bg-gradient-to-r from-tech-teal to-tech-emerald rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              </a>
            </nav>
          </header>

          {/* Experience Section */}
          <section className="mb-20">
            <div className="gradient-border-t glass-morphism-dark backdrop-blur-lg rounded-3xl shadow-tech hover:shadow-tech-hover border border-white/10 pt-16 pb-12 px-8 transition-all duration-500 animate-slide-up">
              <a id="experience" href="#experience" className="group">
                <h2 className="text-5xl md:text-6xl font-black text-white mb-16 group-hover:text-tech-blue transition-all duration-300 text-center tracking-tight text-shadow-md">
                  <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-tech-blue group-hover:to-neon-blue">
                    Experience
                  </span>
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
            <div className="gradient-border-t-purple glass-morphism-dark backdrop-blur-lg rounded-3xl shadow-tech hover:shadow-tech-hover border border-white/10 pt-16 pb-12 px-8 transition-all duration-500 animate-slide-up">
              <a id="projects" href="#projects" className="group">
                <h2 className="text-5xl md:text-6xl font-black text-white mb-16 group-hover:text-tech-purple transition-all duration-300 text-center tracking-tight text-shadow-md">
                  <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-tech-purple group-hover:to-neon-purple">
                    Projects
                  </span>
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
