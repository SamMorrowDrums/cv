import Head from "next/head";
import Link from "next/link";
import BlogPost from "../../components/BlogPost";
import { getDocumentBySlug, getSlugs, blogDirectory } from "../../lib/api";
import markdownToHtml from "../../lib/markDownToHtml";

export default function BlogPostPage({ post }) {
  return (
    <div className="bg-gradient-to-br from-tech-dark via-slate-900 to-tech-slate min-h-screen pb-32 px-4 sm:px-16 relative overflow-hidden">
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-tech-blue rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-tech-purple rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-40 w-56 h-56 bg-tech-teal rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="container mx-auto font-sans relative z-10">
        <Head>
          <title>{post.title} | Sam Morrow</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="grid">
          <div className="place-self-center mt-16 mb-12">
            <Link href="/blog">
              <a className="group relative px-6 py-3 text-lg font-semibold text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-tech-blue to-tech-purple hover:from-neon-blue hover:to-neon-purple transform hover:scale-105 hover:shadow-glow-sm">
                <span className="relative z-10">← Back to Blog</span>
                <div className="absolute inset-0 bg-gradient-to-r from-tech-blue to-tech-purple rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              </a>
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