import Link from "next/link";
import { Car, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  services: [
    { name: "Chauffeur à Douala", href: "/chauffeur-douala" },
    { name: "Chauffeur à Yaoundé", href: "/chauffeur-yaounde" },
    { name: "Chauffeur à Limbe", href: "/chauffeur-limbe" },
    { name: "Chauffeur à Buea", href: "/chauffeur-buea" },
  ],
  company: [
    { name: "À propos", href: "/about" },
    { name: "Tarifs", href: "/tarifs" },
    { name: "Devenir Chauffeur", href: "/register/driver" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Conditions d'utilisation", href: "/terms" },
    { name: "Politique de confidentialité", href: "/privacy" },
    { name: "FAQ", href: "/faq" },
  ],
};

export function Footer() {
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
              La plateforme de référence pour trouver un chauffeur professionnel au Cameroun.
            </p>
            <div className="mt-6 space-y-3">
              <a href="tel:+237600000000" className="flex items-center gap-2 text-sm hover:text-white">
                <Phone className="h-4 w-4" />
                +237 6XX XXX XXX
              </a>
              <a href="mailto:contact@alpha-drivers.cm" className="flex items-center gap-2 text-sm hover:text-white">
                <Mail className="h-4 w-4" />
                contact@alpha-drivers.cm
              </a>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                Douala, Cameroun
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Nos Services
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              L'entreprise
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Informations
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Payment methods */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2">Paiements acceptés</p>
              <div className="flex gap-2">
                <div className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black">
                  MTN MoMo
                </div>
                <div className="rounded bg-orange-500 px-2 py-1 text-xs font-bold text-white">
                  Orange Money
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-center text-sm">
            © {new Date().getFullYear()} Alpha-Drivers. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
