import { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { getServerDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Contact - Alpha-Drivers",
  description: "Contactez l'équipe Alpha-Drivers. Nous sommes disponibles pour répondre à vos questions.",
};

export default async function ContactPage() {
  const t = await getServerDictionary();

  const contactInfo = [
    {
      icon: Phone,
      title: t.contact.phoneTitle,
      detail: t.contact.phoneDetail,
      sub: t.contact.phoneSub,
    },
    {
      icon: Mail,
      title: t.contact.emailTitle,
      detail: t.contact.emailDetail,
      sub: t.contact.emailSub,
    },
    {
      icon: MapPin,
      title: t.contact.addressTitle,
      detail: t.contact.addressDetail,
      sub: t.contact.addressSub,
    },
    {
      icon: Clock,
      title: t.contact.hoursTitle,
      detail: t.contact.hoursDetail,
      sub: t.contact.hoursSub,
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-dark-900 relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] h-[400px] w-[400px] rounded-full bg-primary-500/15 blur-[100px]" />
          <div className="container-app py-20 text-center relative z-10">
            <h1 className="font-display text-5xl font-extrabold text-white sm:text-6xl">
              {t.contact.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              {t.contact.subtitle}
            </p>
          </div>
          <div className="h-16 bg-white" style={{ clipPath: "polygon(0 60%, 100% 0%, 100% 100%, 0% 100%)" }} />
        </section>

        {/* Contact Cards */}
        <section className="section-padding bg-white">
          <div className="container-app max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              {contactInfo.map((item) => (
                <Card key={item.title} className="border-0">
                  <CardContent className="p-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                      <item.icon className="h-7 w-7 text-primary-600" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 font-medium text-gray-900">{item.detail}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
