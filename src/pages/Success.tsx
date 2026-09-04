import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckCircle2 } from "lucide-react";

const Success = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>تمت العملية بنجاح - أُضْحِيَّتْنَا</title>
        <meta name="description" content="شكراً لمساهمتك في حملة أُضْحِيَّتْنَا. سيتواصل فريق جمعية الكلمة الطيبة معك قريباً لتنسيق الاستلام." />
        <link rel="canonical" href="https://eid-idhha.lovable.app/success" />
        <meta name="robots" content="noindex" />
        <meta property="og:title" content="تمت العملية بنجاح - أُضْحِيَّتْنَا" />
        <meta property="og:description" content="شكراً لمساهمتك في حملة أُضْحِيَّتْنَا." />
        <meta property="og:url" content="https://eid-idhha.lovable.app/success" />
      </Helmet>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-soft">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-arabic-display text-3xl sm:text-4xl font-bold text-primary mb-4">
            بارك الله في رزقك 🤲
          </h1>
          <p className="text-base sm:text-lg text-foreground/80 leading-loose">
            مساهمتك في <strong className="text-primary">(أسهم الأمل)</strong> وصلت لجمعية الكلمة الطيبة.
            <br />
            فريق الإدارة سيتصل بك قريباً لتنسيق الاستلام.
          </p>
          <p className="mt-6 text-xl font-bold text-secondary"></p>
          <Link to="/">
            <Button className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6">
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Success;
