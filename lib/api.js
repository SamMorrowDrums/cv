import fs from "fs";
import { join } from "path";
import matter from "gray-matter";

export const experienceDirectory = join(process.cwd(), "_experience");
export const projectsDirectory = join(process.cwd(), "_projects");
export const blogDirectory = join(process.cwd(), "_blog");

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
