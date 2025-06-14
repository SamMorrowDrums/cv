import Head from "next/head";
import Link from "next/link";
import BlogPostPreview from "../../components/BlogPostPreview";
import { getAllBlogPosts } from "../../lib/api";

export default function Blog({ posts }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Head>
          <title>Blog | Sam Morrow</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <div className="mb-10">
            <Link href="/">
              <a className="text-xl font-semibold text-blue-700 hover:text-blue-900 transition-all duration-300 border-b-3 border-transparent hover:border-blue-700 pb-2 px-4 py-2 rounded-lg hover:bg-blue-50/80 transform hover:scale-105">
                ← Back to Home
              </a>
            </Link>
          </div>
          
          <header className="text-center mb-20 py-12 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight">
              Blog
            </h1>
          </header>

          <div className="gradient-border-t bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 pt-16 pb-12 px-8">
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