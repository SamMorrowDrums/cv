import Head from "next/head";
import Link from "next/link";
import BlogPost from "../../components/BlogPost";
import { getDocumentBySlug, getSlugs, blogDirectory } from "../../lib/api";
import markdownToHtml from "../../lib/markDownToHtml";
import SEO from "../../components/SEO";
import { getBlogPostMeta } from "../../lib/seo";

export default function BlogPostPage({ post }) {
  const seoMeta = getBlogPostMeta(post);
  
  return (
    <div className="bg-gradient-to-br from-tech-dark via-slate-900 to-tech-slate min-h-screen pb-32 px-4 sm:px-16 relative overflow-hidden tech-grid">
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-5 md:opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 md:w-64 md:h-64 bg-tech-blue rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-36 h-36 md:w-72 md:h-72 bg-tech-purple rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-40 w-28 h-28 md:w-56 md:h-56 bg-tech-teal rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="container mx-auto font-sans relative z-10">
        <SEO 
          title={seoMeta.title}
          description={seoMeta.description}
          image={seoMeta.image}
          url={seoMeta.url}
          type={seoMeta.type}
          author={seoMeta.author}
          publishedTime={seoMeta.publishedTime}
        />

        <main className="grid">
          <div className="place-self-center mt-16 mb-12">
            <Link href="/blog" className="group relative px-6 py-3 text-lg font-semibold text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-tech-blue to-tech-purple hover:from-neon-blue hover:to-neon-purple transform hover:scale-105 hover:shadow-glow-sm">
              <span className="relative z-10">← Back to Blog</span>
              <div className="absolute inset-0 bg-gradient-to-r from-tech-blue to-tech-purple rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
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