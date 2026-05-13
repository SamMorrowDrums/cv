import BlogPost from "../../components/BlogPost";
import Layout from "../../components/Layout";
import { getDocumentBySlug, getSlugs, blogDirectory } from "../../lib/api";
import markdownToHtml from "../../lib/markDownToHtml";
import SEO from "../../components/SEO";
import { getBlogPostMeta, extractFirstImage } from "../../lib/seo";

export default function BlogPostPage({ post }) {
  const seoMeta = getBlogPostMeta(post);
  
  return (
    <Layout showBackLink backLinkHref="/blog" backLinkText="← Back to Blog">
      <SEO 
        title={seoMeta.title}
        description={seoMeta.description}
        image={seoMeta.image}
        url={seoMeta.url}
        type={seoMeta.type}
        author={seoMeta.author}
        publishedTime={seoMeta.publishedTime}
      />
      
      <BlogPost {...post} />
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const post = getDocumentBySlug(params.slug, blogDirectory);
  const firstImage = extractFirstImage(post.content);
  const content = await markdownToHtml(post.content || "");

  return {
    props: {
      post: {
        ...post,
        content,
        ...(firstImage && { image: firstImage }),
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