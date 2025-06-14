import fs from "fs";
import { join } from "path";
import matter from "gray-matter";

export const experienceDirectory = join(process.cwd(), "_experience");
export const projectsDirectory = join(process.cwd(), "_projects");
export const blogDirectory = join(process.cwd(), "_blog");

function generateExcerpt(content, maxLength = 150) {
  if (!content) return "";
  
  // Remove markdown headers, links, and other formatting
  const cleanContent = content
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to just text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
    .replace(/`([^`]+)`/g, '$1') // Remove code formatting
    .replace(/\n\s*\n/g, ' ') // Replace double newlines with space
    .replace(/\n/g, ' ') // Replace single newlines with space
    .trim();
  
  // Get the first meaningful paragraph
  const sentences = cleanContent.split(/[.!?]+/);
  let excerpt = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (trimmedSentence.length > 0) {
      if (excerpt.length + trimmedSentence.length + 1 <= maxLength) {
        excerpt += (excerpt ? '. ' : '') + trimmedSentence;
      } else {
        break;
      }
    }
  }
  
  // If we have a complete sentence, add period if needed
  if (excerpt && !excerpt.match(/[.!?]$/)) {
    excerpt += '...';
  }
  
  return excerpt || cleanContent.substring(0, maxLength) + '...';
}

export function getSlugs(directory = experienceDirectory) {
  return fs.readdirSync(directory);
}

export function getDocumentBySlug(slug, directory = experienceDirectory) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(directory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const items = {
    ...data,
    slug: realSlug,
    content,
  };

  // Add excerpt for blog posts
  if (directory === blogDirectory) {
    items.excerpt = generateExcerpt(content);
  }

  return items;
}

const defaultSort = (post1, post2) =>
  post1.fromDate > post2.fromDate ? "-1" : "1";

const blogSort = (post1, post2) =>
  post1.date > post2.date ? "-1" : "1";

export function getAllDocuments(
  directory = experienceDirectory,
  sort = defaultSort
) {
  const slugs = getSlugs(directory);
  return (
    slugs
      .map((slug) => getDocumentBySlug(slug, directory))
      // sort posts by date in descending order
      .sort(sort)
  );
}

export function getAllBlogPosts() {
  return getAllDocuments(blogDirectory, blogSort);
}
