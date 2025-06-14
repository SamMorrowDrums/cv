import Head from "next/head";
import Link from "next/link";
import BlogPost from "../../components/BlogPost";
import { getDocumentBySlug, getSlugs, blogDirectory } from "../../lib/api";
import markdownToHtml from "../../lib/markDownToHtml";

export default function BlogPostPage({ post }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen pb-32 px-4 sm:px-16">
      <div className="container mx-auto font-sans">
        <Head>
          <title>{post.title} | Sam Morrow</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="grid">
          <div className="place-self-center mt-16 mb-12">
            <Link href="/blog">
              <a className="text-xl font-semibold text-blue-700 hover:text-blue-900 transition-all duration-300 border-b-3 border-transparent hover:border-blue-700 pb-2 px-4 py-2 rounded-lg hover:bg-blue-50/80 transform hover:scale-105">← Back to Blog</a>
            </Link>
          </div>
          
          <BlogPost {...post} />
        </main>
      </div>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const post = getDocumentBySlug(params.slug, blogDirectory);
  const content = await markdownToHtml(post.content || "");

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const slugs = getSlugs(blogDirectory);

  return {
    paths: slugs.map((slug) => ({
      params: {
        slug: slug.replace(/\.md$/, ""),
      },
    })),
    fallback: false,
  };
}