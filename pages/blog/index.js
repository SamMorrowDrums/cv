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
        <div className="flex items-center justify-between">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary dark:text-dark-primary tracking-tight">
            Blog
          </h1>
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent transition-colors duration-200"
            title="RSS Feed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <circle cx="6.18" cy="17.82" r="2.18" />
              <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
            </svg>
          </a>
        </div>
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
