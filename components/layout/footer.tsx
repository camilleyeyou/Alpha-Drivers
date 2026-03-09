import Link from "next/link";
import { Car, Mail, Phone, MapPin } from "lucide-react";
import { getServerDictionary } from "@/lib/i18n";

const cityNames = ["Douala", "Yaoundé", "Limbe", "Buea"];
const cityHrefs = ["/chauffeur-douala", "/chauffeur-yaounde", "/chauffeur-limbe", "/chauffeur-buea"];

export async function Footer() {
  const t = await getServerDictionary();

  const serviceLinks = cityNames.map((city, i) => ({
    name: t.footer.driverIn.replace("{city}", city),
    href: cityHrefs[i],
  }));

  const companyLinks = [
    { name: t.footer.about, href: "/about" },
    { name: t.footer.pricing, href: "/tarifs" },
    { name: t.footer.becomeDriver, href: "/register/driver" },
    { name: t.footer.contact, href: "/contact" },
  ];

  const legalLinks = [
    { name: t.footer.termsOfUse, href: "/terms" },
    { name: t.footer.privacyPolicy, href: "/privacy" },
    { name: t.footer.faq, href: "/faq" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Alpha<span className="text-primary-400">Drivers</span>
              </span>
            </Link>
            <p className="mt-4 text-sm">
              {t.footer.description}
            </p>
            <div className="mt-6 space-y-3">
              <a href="tel:+237600000000" className="flex items-center gap-2 text-sm hover:text-white">
                <Phone className="h-4 w-4" />
                {t.footer.phone}
              </a>
              <a href="mailto:contact@alpha-drivers.cm" className="flex items-center gap-2 text-sm hover:text-white">
                <Mail className="h-4 w-4" />
                {t.footer.email}
              </a>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                {t.footer.location}
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.footer.services}
            </h3>
            <ul className="mt-4 space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white hover:underline underline-offset-4 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.footer.company}
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white hover:underline underline-offset-4 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.footer.info}
            </h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white hover:underline underline-offset-4 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Payment methods */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2">{t.footer.paymentsAccepted}</p>
              <div className="flex gap-2">
                <div className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black transition-transform duration-150 hover:scale-105">
                  {t.footer.mtnMomo}
                </div>
                <div className="rounded bg-orange-500 px-2 py-1 text-xs font-bold text-white transition-transform duration-150 hover:scale-105">
                  {t.footer.orangeMoney}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-center text-sm">
            {t.footer.copyright.replace("{year}", new Date().getFullYear().toString())}
          </p>
        </div>
      </div>
    </footer>
  );
}
