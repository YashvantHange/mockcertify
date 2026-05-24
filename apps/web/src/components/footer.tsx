import Link from "next/link";
import { allCertifications } from "@/data/catalog";

const popularCerts = allCertifications.slice(0, 8);

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/categories">All certifications</Link></li>
              <li><Link href="/leaderboard">Leaderboard</Link></li>
              <li><Link href="/signup">Sign up free</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Popular practice exams</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {popularCerts.map((cert) => (
                <li key={cert.slug}>
                  <Link href={`/certifications/${cert.slug}`}>{cert.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/about">About MockCertify</Link></li>
              <li><Link href="/community">Community</Link></li>
              <li><Link href="/login">Log in</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white mb-1">MockCertify</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Mock Certify — free IT certification practice exams at mockcertify.com. Timed and practice modes.
            </p>
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} MockCertify. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
