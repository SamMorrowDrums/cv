import Head from "next/head";
import Link from "next/link";
import BlogPostPreview from "../../components/BlogPostPreview";
import { getAllBlogPosts } from "../../lib/api";
import SEO from "../../components/SEO";

export default function Blog({ posts }) {
  return (
    <div className="bg-gradient-to-br from-tech-dark via-slate-900 to-tech-slate min-h-screen relative overflow-hidden tech-grid dynamic-bg scan-lines">
      {/* Enhanced animated background pattern */}
      <div className="absolute inset-0 opacity-10 md:opacity-15">
        <div className="absolute top-20 left-20 w-32 h-32 md:w-64 md:h-64 bg-tech-blue rounded-full mix-blend-multiply filter blur-xl animate-float shadow-electric"></div>
        <div className="absolute top-40 right-20 w-36 h-36 md:w-72 md:h-72 bg-tech-purple rounded-full mix-blend-multiply filter blur-xl animate-float shadow-plasma" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-40 w-28 h-28 md:w-56 md:h-56 bg-tech-teal rounded-full mix-blend-multiply filter blur-xl animate-float shadow-cyber-glow" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-60 right-60 w-20 h-20 md:w-40 md:h-40 bg-hot-pink rounded-full mix-blend-multiply filter blur-lg animate-bounce-slow shadow-laser" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-60 w-24 h-24 md:w-48 md:h-48 bg-electric-lime rounded-full mix-blend-multiply filter blur-lg animate-pulse-slow shadow-voltage" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <SEO 
          title="Blog"
          description="Thoughts and insights on software engineering, technology, and continuous learning."
          image="/og-images/blog.png"
          url="/blog"
        />

        <main>
          <div className="mb-10">
            <Link href="/" className="group relative px-6 py-3 text-lg font-semibold text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-tech-blue to-tech-purple hover:from-hot-pink hover:to-electric-lime transform hover:scale-110 hover:shadow-electric">
              <span className="relative z-10 neon-text">← Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-tech-blue to-tech-purple rounded-xl blur opacity-40 group-hover:opacity-80 transition-opacity duration-300 animate-rainbow"></div>
            </Link>
          </div>

          <header className="text-center mb-20 py-16 glass-morphism-dark rounded-3xl shadow-electric hover:shadow-plasma transition-all duration-500 border border-white/10 animate-slide-up plasma-border">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight neon-text text-shadow-lg">
              <span className="bg-gradient-to-r from-neon-blue via-hot-pink via-electric-lime to-neon-teal bg-clip-text text-transparent animate-rainbow">
                Blog
              </span>
            </h1>
          </header>

          <div className="gradient-border-t glass-morphism-dark backdrop-blur-lg rounded-3xl shadow-multi-glow hover:shadow-voltage border border-white/10 pt-16 pb-12 px-8 transition-all duration-500 animate-slide-up retro-grid">
            <div className="space-y-16">
              {posts.map((post) => (
                <BlogPostPreview key={post.slug} {...post} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const posts = getAllBlogPosts();

  return {
    props: { posts },
  };
}
