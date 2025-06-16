import Experience from "../components/Experience";
import Project from "../components/Project";
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
    <div className="bg-gradient-to-br from-tech-dark via-slate-900 to-tech-slate min-h-screen relative overflow-hidden tech-grid dynamic-bg scan-lines">
      {/* Enhanced animated background pattern with more elements */}
      <div className="absolute inset-0 opacity-10 md:opacity-15">
        {/* Original floating orbs with enhanced effects */}
        <div className="absolute top-20 left-20 w-32 h-32 md:w-64 md:h-64 bg-tech-blue rounded-full mix-blend-multiply filter blur-xl animate-float shadow-electric"></div>
        <div className="absolute top-40 right-20 w-36 h-36 md:w-72 md:h-72 bg-tech-purple rounded-full mix-blend-multiply filter blur-xl animate-float shadow-plasma" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-40 w-28 h-28 md:w-56 md:h-56 bg-tech-teal rounded-full mix-blend-multiply filter blur-xl animate-float shadow-cyber-glow" style={{animationDelay: '4s'}}></div>
        
        {/* New jazzy floating elements */}
        <div className="absolute top-60 left-60 w-20 h-20 md:w-40 md:h-40 bg-hot-pink rounded-full mix-blend-multiply filter blur-lg animate-bounce-slow shadow-laser" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 right-60 w-24 h-24 md:w-48 md:h-48 bg-electric-lime rounded-full mix-blend-multiply filter blur-lg animate-pulse-slow shadow-voltage" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-80 right-40 w-16 h-16 md:w-32 md:h-32 bg-neon-orange rounded-full mix-blend-multiply filter blur-lg animate-spin-slow shadow-neon-rainbow" style={{animationDelay: '5s'}}></div>
        
        {/* Geometric shapes for added excitement */}
        <div className="absolute top-32 right-80 w-12 h-12 md:w-24 md:h-24 bg-gradient-to-r from-cyber-yellow to-voltage-blue transform rotate-45 mix-blend-multiply filter blur-md animate-wave" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute bottom-60 left-80 w-8 h-8 md:w-16 md:h-16 bg-gradient-to-r from-laser-red to-electric-purple transform rotate-12 mix-blend-multiply filter blur-sm animate-wiggle" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <SEO 
          title="Sam Morrow"
          description="Drummer, software engineer and online-learning fanatic."
          image="/og-images/home.png"
          url=""
        />

        <main>
          {/* Header Section */}
          <header className="text-center mb-20 py-16 glass-morphism-dark rounded-3xl shadow-electric hover:shadow-plasma transition-all duration-500 border border-white/10 animate-slide-up hover-electric plasma-border">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight neon-text text-shadow-lg">
              <span className="bg-gradient-to-r from-neon-blue via-hot-pink via-electric-lime to-neon-teal bg-clip-text text-transparent animate-rainbow">
                Sam Morrow
              </span>
              <span className="text-neon-blue animate-blink ml-2 animate-color-shift">|</span>
            </h1>

            <p className="text-2xl md:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-neon-glow">
              Drummer, <span className="text-tech-blue font-semibold rainbow-text">software engineer</span> and <span className="text-tech-teal font-semibold electric-text">online-learning fanatic</span>.
            </p>

            <nav className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <Link href="/blog" className="group relative px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-semibold text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-tech-blue to-tech-purple hover:from-hot-pink hover:to-electric-lime transform hover:scale-110 hover:shadow-electric w-full sm:w-auto text-center block animate-scale-pulse">
                <span className="relative z-10 neon-text">Blog</span>
                <div className="absolute inset-0 bg-gradient-to-r from-tech-blue to-tech-purple rounded-xl blur opacity-40 group-hover:opacity-80 transition-opacity duration-300 animate-rotate-glow"></div>
              </Link>
              <a
                href="https://github.com/sammorrowdrums"
                rel="noopener noreferrer"
                target="_blank"
                className="group relative px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-semibold text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-tech-teal to-tech-emerald hover:from-neon-orange hover:to-voltage-blue transform hover:scale-110 hover:shadow-cyber-glow w-full sm:w-auto text-center block animate-wave"
              >
                <span className="relative z-10 cyber-glow">GitHub</span>
                <div className="absolute inset-0 bg-gradient-to-r from-tech-teal to-tech-emerald rounded-xl blur opacity-40 group-hover:opacity-80 transition-opacity duration-300 animate-rainbow"></div>
              </a>
            </nav>
          </header>

          {/* Experience Section */}
          <section className="mb-20">
            <div className="gradient-border-t glass-morphism-dark backdrop-blur-lg rounded-3xl shadow-multi-glow hover:shadow-electric border border-white/10 pt-16 pb-12 px-8 transition-all duration-500 animate-slide-up hover:scale-[1.01] retro-grid">
              <a id="experience" href="#experience" className="group">
                <h2 className="text-5xl md:text-6xl font-black text-white mb-16 group-hover:text-tech-blue transition-all duration-300 text-center tracking-tight text-shadow-md animate-wiggle">
                  <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-electric-lime group-hover:to-hot-pink electric-text">
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
            <div className="gradient-border-t-purple glass-morphism-dark backdrop-blur-lg rounded-3xl shadow-plasma hover:shadow-voltage border border-white/10 pt-16 pb-12 px-8 transition-all duration-500 animate-slide-up hover:scale-[1.01] holographic">
              <a id="projects" href="#projects" className="group">
                <h2 className="text-5xl md:text-6xl font-black text-white mb-16 group-hover:text-tech-purple transition-all duration-300 text-center tracking-tight text-shadow-md animate-pulse-slow">
                  <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-neon-orange group-hover:to-cyber-yellow rainbow-text">
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
