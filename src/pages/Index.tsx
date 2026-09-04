import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { SiteHeader } from "@/components/SiteHeader";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { DonationDialog } from "@/components/DonationDialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HandHeart, Coins } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroSchoolAsset from "@/assets/hero-school.jpg.asset.json";
const heroImage = heroSchoolAsset.url;

const GOAL = 30000;


const Index = () => {
  const [open, setOpen] = useState(false);
  const [initialTrack, setInitialTrack] = useState<"financial" | "shoulders" | null>(null);
  const [total, setTotal] = useState(0);


  const fetchTotal = async () => {
    const { data, error } = await supabase.rpc("get_donation_total");
    if (!error && data && data.length > 0) {
      setTotal(Number(data[0].total_amount) || 0);
    }

  };

  useEffect(() => {
    fetchTotal();
    const channel = supabase
      .channel("donations-progress")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donations" },
        () => fetchTotal()
      )
      .subscribe();
    const interval = setInterval(fetchTotal, 30000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const percentage = Math.min((total / GOAL) * 100, 100);


  const openWith = (track: "financial" | "shoulders") => {
    setInitialTrack(track);
    setOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background hearts-bg">
      <Helmet>
        <title>أُضْحِيَّتْنَا - حملة التبرع لعيد الأضحى</title>
        <meta name="description" content="ساهم في مشروع أضحيتنا لعيد الأضحى مع جمعية الكلمة الطيبة بصفاقس - سهم 50د، 100د، صدقة الأكتاف للعائلات المعوزة." />
        <link rel="canonical" href="https://eid-idhha.lovable.app/" />
        <meta property="og:title" content="أُضْحِيَّتْنَا - حملة التبرع لعيد الأضحى" />
        <meta property="og:description" content="ساهم في مشروع أضحيتنا مع جمعية الكلمة الطيبة بصفاقس." />
        <meta property="og:url" content="https://eid-idhha.lovable.app/" />
      </Helmet>
      <InAppBrowserBanner />
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image (left in LTR, appears left in RTL via order) */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-soft">
                <img
                  src={heroImage}
                  alt="أضحيتنا - عيد الأضحى"
                  width={1200}
                  height={800}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Text (right) */}
            <div className="order-2 lg:order-1 text-right space-y-5">
              <h1 className="font-arabic-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                أسهم الأمل
              </h1>
              <p className="text-lg text-secondary font-bold">
                قال رسول الله صلى الله عليه وسلم: «وَاللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ».
              </p>
              <p className="text-base text-foreground/80 leading-relaxed">
                مع قرب العودة المدرسية، تطلق <span className="font-bold">الجمعية الخيرية الكلمة الطيبة</span> مشروع <span className="font-bold">"أسهم الأمل"</span> باش نوفرو المستلزمات والأدوات المدرسية لصغارنا من العائلات المعوزة.
                <br />هدفنا: إعانة 280 تلميذاً (قيمة المساعدة الواحدة 100 دينار).
                <br />تبرعك اليوم.. أملهم غداً.
              </p>

              {/* Progress */}
              <div className="space-y-2 pt-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">المبلغ المجموع</span>
                  <span className="text-2xl font-bold text-secondary">
                    {total.toLocaleString("ar-TN")} دينار
                  </span>
                </div>
                <Progress value={percentage} className="h-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{percentage.toFixed(1)}% من الهدف</span>
                  <span>الهدف: {GOAL.toLocaleString("ar-TN")} دينار</span>
                </div>
              </div>


              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Button
                  onClick={() => openWith("financial")}
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold py-6 shadow-soft"
                >
                  <Coins className="ml-2 h-5 w-5" />
                  مساهمة مالية
                </Button>
                <Button
                  onClick={() => openWith("shoulders")}
                  size="lg"
                  variant="outline"
                  className="flex-1 border-2 border-secondary bg-secondary/10 hover:bg-secondary/20 text-foreground text-base font-bold py-6"
                >
                  <HandHeart className="ml-2 h-5 w-5" />
                  مساهمة عينية
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      <DonationDialog open={open} onOpenChange={setOpen} initialTrack={initialTrack} />
    </div>
  );
};

export default Index;
