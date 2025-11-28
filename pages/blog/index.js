import BlogPostPreview from "../../components/BlogPostPreview";
import Layout from "../../components/Layout";
import { getAllBlogPosts } from "../../lib/api";
import SEO from "../../components/SEO";

export default function Blog({ posts }) {
  return (
    <Layout showBackLink backLinkHref="/" backLinkText="← Home">
      <SEO 
        title="Blog"
        description="Thoughts and insights on software engineering, technology, and continuous learning."
        image="/og-images/blog.png"
        url="/blog"
      />

      <header className="mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary dark:text-dark-primary tracking-tight">
          Blog
        </h1>
      </header>

      <div className="space-y-12">
        {posts.map((post) => (
          <BlogPostPreview key={post.slug} {...post} />
        ))}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const posts = getAllBlogPosts();

  return {
    props: { posts },
  };
}
