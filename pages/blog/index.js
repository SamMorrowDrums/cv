import Head from "next/head";
import Link from "next/link";
import BlogPostPreview from "../../components/BlogPostPreview";
import { getAllBlogPosts } from "../../lib/api";

export default function Blog({ posts }) {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Head>
          <title>Blog | Sam Morrow</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <div className="mb-8">
            <Link href="/">
              <a className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 border-b-2 border-transparent hover:border-blue-600 pb-1">
                ← Back to Home
              </a>
            </Link>
          </div>
          
          <header className="text-center mb-16 py-8">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Blog
            </h1>
          </header>

          <div className="border-t border-gray-200 pt-8">
            <div className="space-y-8">
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