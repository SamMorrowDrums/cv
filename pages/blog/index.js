import Head from "next/head";
import Link from "next/link";
import BlogPostPreview from "../../components/BlogPostPreview";
import { getAllBlogPosts } from "../../lib/api";

export default function Blog({ posts }) {
  return (
    <div className="bg-gray-100 min-h-screen pb-32 px-4 sm:px-16">
      <div className="container mx-auto font-sans">
        <Head>
          <title>Blog | Sam Morrow</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="grid">
          <div className="place-self-center mt-16 mb-8">
            <Link href="/">
              <a className="text-blue-500 hover:underline text-lg">← Back to Home</a>
            </Link>
          </div>
          
          <h1 className="text-6xl md:text-8xl place-self-center mb-16">
            Blog
          </h1>

          <div className="border-t pt-8">
            {posts.map((post) => (
              <BlogPostPreview key={post.slug} {...post} />
            ))}
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