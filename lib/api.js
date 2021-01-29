import fs from "fs";
import { join } from "path";
import matter from "gray-matter";

const experienceDirectory = join(process.cwd(), "_experience");

export function getExperienceSlugs() {
  return fs.readdirSync(experienceDirectory);
}

export function getExperienceBySlug(slug, fields = []) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(experienceDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const items = {
    slug: realSlug,
    content,
  };

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (data[field]) {
      items[field] = data[field];
    }
  });

  return items;
}

export function getAllExperiences(fields = []) {
  const slugs = getExperienceSlugs();
  return (
    slugs
      .map((slug) => getExperienceBySlug(slug, fields))
      // sort posts by date in descending order
      .sort((post1, post2) => (post1.fromDate > post2.fromDate ? "-1" : "1"))
  );
}
