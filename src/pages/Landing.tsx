import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Star,
  BarChart2,
  Shield,
  ScanLine,
  Bot,
  Github,
  Linkedin,
  Mail,
  Lock,
  FileCheck,
  Network,
  CheckCircle2,
} from "lucide-react";

import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarMarcus from "@/assets/avatar-marcus.jpg";
import avatarPriya from "@/assets/avatar-priya.jpg";

const features = [
  {
    title: "Secure patient records",
    description: "End-to-end encrypted health records accessible only with patient consent via QR verification.",
    icon: Lock,
  },
  {
    title: "Clinical Decision Support",
    description: "AI-assisted summaries with risk scoring powered by retrieval (RAG) and ML-based signals.",
    icon: Bot,
  },
  {
    title: "Interoperable integrations",
    description: "Connect EHR systems, lab platforms, imaging tools, and 20+ healthcare APIs with HL7/FHIR compliance.",
    icon: Network,
  },
  {
    title: "Unified patient hub",
    description: "Manage, monitor, and track every patient from a single clinical dashboard.",
    icon: FileCheck,
  },
];

const rotatingWords = ["records.", "diagnostics.", "clarity.", "retrieval."];

const TRUST_BADGES = [
  { label: "HIPAA Compliant", icon: Shield },
  { label: "HL7/FHIR Ready", icon: Network },
  { label: "SOC 2 Type II", icon: Lock },
];

const Landing = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setWordIndex((prev) => (prev + 1) % rotatingWords.length), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setNavVisible(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sticky nav */}
      <motion.nav
        className="fixed top-0 w-full z-50 bg-primary shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: navVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6 lg:px-8">
          <Link to="/">
            <Logo variant="white" size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm font-semibold text-white hover:bg-white/15 hover:text-white" asChild>
              <Link to="/patient-login">Patient Login</Link>
            </Button>
            <Button className="hidden sm:inline-flex text-sm font-semibold bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/clinical-portal">Clinical Portal</Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-32">
          <motion.div className="text-center max-w-3xl mx-auto relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-center mb-6">
              <Logo variant="with-text" size="3xl" />
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
              {TRUST_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <span key={badge.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/5 border border-primary/15 text-xs font-medium text-primary">
                    <Icon className="w-3.5 h-3.5" />
                    {badge.label}
                  </span>
                );
              })}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.1] text-foreground mb-6">
              The platform that secures
              <br />
              your medical{" "}
              <span className="inline-block relative translate-y-[6px]" style={{ minWidth: "7ch" }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={rotatingWords[wordIndex]}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.3 }}
                    className="text-primary inline-block"
                  >
                    {rotatingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
                <span className="invisible block h-0 overflow-hidden" aria-hidden="true">sovereignty.</span>
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Patient-controlled access with AI-assisted clinical decision support.
              Retrieval-augmented generation keeps summaries grounded in verified records.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button size="lg" className="text-sm font-semibold px-6" asChild>
                <Link to="/patient-login">Enter Portal <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="text-sm font-semibold px-6" asChild>
                <Link to="/clinical-portal">Clinical Access</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-24 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-10">
            How MediLink works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Patient scans QR", description: "A unique, encrypted QR code ties identity to records — no passwords needed." },
              { step: "02", title: "Consent & retrieval", description: "Access is granted via patient consent. AI retrieves relevant notes and labs (RAG) before summarizing." },
              { step: "03", title: "Clinical Decision Support", description: "Clinicians see ML-prioritized summaries, vitals, and patient longitudinal records in one view." },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <div className="relative">
                  <span className="text-xs font-mono font-semibold text-primary mb-3 block">STEP {item.step}</span>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 bg-card border-t border-border">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground tracking-tight">
              Everything you need for modern healthcare
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From patient onboarding to clinical decision support, MediLink has you covered.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                  <Card className="h-full hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground tracking-tight">
              Trusted by clinicians
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { quote: "MediLink cut our patient intake time by 80%. Instant digital access replaced paper records.", name: "Dr. Sarah Chen", role: "Cardiologist, MD", avatar: avatarSarah },
              { quote: "The grounded summaries cite underlying records for compliance. Finally, fast answers we can trust.", name: "Marcus Williams", role: "Hospital CTO", avatar: avatarMarcus },
              { quote: "Patients feel in control of their data for the first time with the QR consent system.", name: "Dr. Priya Patel", role: "Family Medicine, MD", avatar: avatarPriya },
              { quote: "We replaced three legacy systems with MediLink. Everything in one place is transformative.", name: "James Liu", role: "Clinic Administrator", avatar: "https://i.pravatar.cc/300?img=33" },
              { quote: "AI summaries are accurate enough to assess a new patient in under a minute.", name: "Dr. Amara Osei", role: "Emergency Medicine, MD", avatar: "https://i.pravatar.cc/300?img=47" },
            ].map((testimonial, i) => (
              <motion.div key={testimonial.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                <Card className="h-full hover:shadow-md transition-shadow duration-200">
                  <div className="h-[160px] overflow-hidden rounded-t-lg">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover object-center" />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-foreground text-sm leading-relaxed mb-4">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Card className="p-8 lg:p-12">
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground tracking-tight">
                  Ready to secure your health data?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  Join clinicians and patients who trust MediLink for ML-powered, retrieval-grounded summaries with patient-controlled access.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                  <Button size="lg" className="text-sm font-semibold px-6" asChild>
                    <Link to="/patient-login">Enter the portal <ArrowRight className="ml-2 w-4 h-4" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-sm font-semibold px-6" asChild>
                    <Link to="/clinical-portal">Clinical view</Link>
                  </Button>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {[
                { title: "RAG + citations", desc: "Summaries grounded in uploaded reports and labs.", icon: Bot },
                { title: "Document extraction", desc: "Turn PDFs/scans into usable structured data.", icon: ScanLine },
                { title: "FHIR-ready formats", desc: "Standardized records for interoperability.", icon: Network },
                { title: "Risk detection", desc: "Flags allergies, interactions, and duplications.", icon: Shield },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg border border-border bg-background p-4 text-left">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">{item.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <Logo size="md" />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
                A patient-controlled health platform with RAG-grounded summaries, structured timelines, and ML risk flags — designed for fast, safe clinical decisions.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" className="font-semibold" asChild>
                  <Link to="/patient-login">Patient portal <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                <Button size="sm" variant="outline" className="font-semibold" asChild>
                  <Link to="/clinical-portal">Clinical portal</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Product</p>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">RAG + citations</a></li>
                  <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">FHIR-ready formats</a></li>
                  <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Risk detection</a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Portals</p>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/patient-login" className="text-muted-foreground hover:text-foreground transition-colors">Patient login</Link></li>
                  <li><Link to="/clinical-portal" className="text-muted-foreground hover:text-foreground transition-colors">Clinical portal</Link></li>
                  <li><Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Admin auth</Link></li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <Card className="p-5">
                <p className="font-semibold text-foreground mb-1">Get product updates</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Stay informed about new features and compliance updates.
                </p>
                <div className="flex gap-2">
                  <Input placeholder="you@clinic.com" className="h-9" />
                  <Button className="h-9 px-4 font-semibold text-xs">Join</Button>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {[
                    { href: "https://github.com/", icon: Github, label: "GitHub" },
                    { href: "https://www.linkedin.com/", icon: Linkedin, label: "LinkedIn" },
                    { href: "mailto:hello@medilink.health", icon: Mail, label: "Email" },
                  ].map((link) => {
                    const Icon = link.icon;
                    return (
                      <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-md border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors" aria-label={link.label}>
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </a>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">© 2026 MediLink. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {TRUST_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <span key={badge.label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-background text-xs">
                    <Icon className="w-3 h-3" />
                    {badge.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
