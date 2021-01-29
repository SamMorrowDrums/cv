import Experience from "../components/Experience";

import styles from "../styles/Home.module.css";
import { getAllExperiences } from "../lib/api";
import Head from "next/head";

export default function Home({ experiences }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Sam Morrow</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Sam Morrow</h1>

        <p className={styles.description}>
          Drummer, software engineer and online-learning fanatic.
        </p>

        <div className={styles.grid}>
          <ul>
            <li>
              <a
                href="https://sammorrowdrums.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                Blog
              </a>
            </li>
            <li>
              <a>CV</a>
            </li>
            <li>
              <a
                href="https://github.com/sammorrowdrums"
                rel="noopener noreferrer"
                target="_blank"
              >
                Github
              </a>
            </li>
          </ul>
        </div>
        <div>
          {experiences.map((exp) => (
            <Experience {...exp} />
          ))}
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const experiences = getAllExperiences([
    "company",
    "position",
    "fromDate",
    "toDate",
    "location",
    "link",
    "content",
  ]);

  return {
    props: { experiences },
  };
}
