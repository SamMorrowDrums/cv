import Experience from "../components/Experience";
import Project from "../components/Project";
import Layout from "../components/Layout";
import {
  getAllDocuments,
  experienceDirectory,
  projectsDirectory,
} from "../lib/api";
import markdownToHtml from "../lib/markDownToHtml";
import SEO from "../components/SEO";
import Link from "next/link";

export default function Home({ experiences, projects }) {
  return (
    <Layout>
      <SEO 
        title="Sam Morrow"
        description="Software engineer, open source contributor, always learning."
        image="/og-images/home.png"
        url=""
      />

      {/* Header Section */}
      <header className="mb-16 sm:mb-24">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary dark:text-dark-primary mb-4 tracking-tight">
          Sam Morrow
        </h1>
        <p className="text-lg sm:text-xl text-secondary dark:text-dark-secondary mb-8 leading-relaxed">
          I’m a Senior Software Engineer at GitHub, where I work on AI developer tools. I build and maintain the GitHub MCP Server and contribute to the MCP specification.
I love open source, enjoy speaking about MCP at events, and maintain starter templates to help others get going with the protocol. I’m always picking up something new.
Before I wrote code for a living, I was a professional drummer.
        </p>
        <nav className="flex flex-wrap gap-4">
          <Link 
            href="/blog" 
            className="text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover transition-colors duration-200 font-medium"
          >
            Blog →
          </Link>
          <a
            href="https://github.com/sammorrowdrums"
            rel="noopener noreferrer"
            target="_blank"
            className="text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover transition-colors duration-200 font-medium"
          >
            GitHub →
          </a>
        </nav>
      </header>

      {/* Experience Section */}
      <section className="mb-16 sm:mb-24">
        <h2 id="experience" className="text-2xl sm:text-3xl font-bold text-primary dark:text-dark-primary mb-8 tracking-tight">
          Experience
        </h2>
        <div className="space-y-12">
          {experiences.map((exp) => (
            <Experience key={exp.fromDate} {...exp} />
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section>
        <h2 id="projects" className="text-2xl sm:text-3xl font-bold text-primary dark:text-dark-primary mb-8 tracking-tight">
          Projects
        </h2>
        <div className="space-y-12">
          {projects.map((proj) => (
            <Project key={proj.fromDate} {...proj} />
          ))}
        </div>
      </section>
    </Layout>
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
