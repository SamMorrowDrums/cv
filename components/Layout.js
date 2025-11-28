import Link from "next/link";

export default function Layout({ children, showBackLink = false, backLinkHref = "/", backLinkText = "← Back" }) {
  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {showBackLink && (
          <nav className="mb-8 sm:mb-12">
            <Link 
              href={backLinkHref} 
              className="text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary transition-colors duration-200 text-sm"
            >
              {backLinkText}
            </Link>
          </nav>
        )}
        <main>
          {children}
        </main>
        <footer className="mt-16 sm:mt-24 pt-8 border-t border-border dark:border-dark-border">
          <p className="text-secondary dark:text-dark-secondary text-sm">
            © {new Date().getFullYear()} Sam Morrow
          </p>
        </footer>
      </div>
    </div>
  );
}
