import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  headquartersSchema,
  homePickupSchema,
  type HeadquartersForm,
  type HomePickupForm,
} from "@/lib/donation-schemas";
import { Loader2, MapPin, Building2, Home, LocateFixed } from "lucide-react";

type Method = "headquarters" | "home" | null;

export const ShouldersDonationForm = ({ onBack }: { onBack: () => void }) => {
  const [method, setMethod] = useState<Method>(null);

  if (!method) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-center">كيف ستصلنا الصدقة؟</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMethod("headquarters")}
            className="rounded-2xl border-2 border-border p-6 text-center hover:border-primary hover:bg-primary/5 transition-all"
          >
            <Building2 className="h-10 w-10 mx-auto mb-3 text-primary" />
            <p className="font-bold text-lg mb-1">سآتي للمقر</p>
            <p className="text-sm text-muted-foreground">ساقية الدائر</p>
          </button>
          <button
            onClick={() => setMethod("home")}
            className="rounded-2xl border-2 border-border p-6 text-center hover:border-primary hover:bg-primary/5 transition-all"
          >
            <Home className="h-10 w-10 mx-auto mb-3 text-primary" />
            <p className="font-bold text-lg mb-1">تعالوا خذوا الأدوات</p>
            <p className="text-sm text-muted-foreground">في نطاق 10 كم من ساقية الدائر</p>
          </button>
        </div>
      </div>
    );
  }

  return method === "headquarters" ? (
    <HeadquartersFlow onBack={() => setMethod(null)} />
  ) : (
    <HomePickupFlow onBack={() => setMethod(null)} />
  );
};

const HeadquartersFlow = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<HeadquartersForm>({
    resolver: zodResolver(headquartersSchema),
    defaultValues: { full_name: "", phone: "" },
  });

  const onSubmit = async (values: HeadquartersForm) => {
    setSubmitting(true);
    const { error } = await supabase.from("donations").insert({
      track: "shoulders",
      project_type: "Adha",
      full_name: values.full_name,
      phone: values.phone,
      pickup_required: false,
      pickup_method: "headquarters",
    });
    setSubmitting(false);
    if (error) {
      toast.error("صار خطأ، عاود من فضلك");
      return;
    }
    navigate("/success");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="rounded-xl bg-secondary/15 border border-secondary/40 p-4 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-foreground">مقر الجمعية: ساقية الدائر، صفاقس</p>
            <p className="text-muted-foreground">يوم العيد من الساعة 10:00 إلى المغرب</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">الاسم و اللقب *</Label>
          <Input id="full_name" {...form.register("full_name")} />
          {form.formState.errors.full_name && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.full_name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input id="phone" {...form.register("phone")} dir="ltr" />
          {form.formState.errors.phone && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="button" variant="outline" onClick={onBack}>رجوع</Button>
        <Button type="submit" disabled={submitting} className="flex-1 bg-primary text-primary-foreground py-6 text-base font-bold">
          {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          تأكيد التسجيل
        </Button>
      </div>
    </form>
  );
};

const HomePickupFlow = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const form = useForm<HomePickupForm>({
    resolver: zodResolver(homePickupSchema),
    defaultValues: { full_name: "", phone: "", gps_location: "" },
  });

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("المتصفح ما يدعمش تحديد الموقع");
      return;
    }
    const ua = navigator.userAgent || "";
    const inAppBrowser = /(FBAN|FBAV|Instagram|Messenger|Line\/|Twitter|TikTok)/i.test(ua);

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        form.setValue("gps_location", url, { shouldValidate: true });
        toast.success("تم تحديد موقعك");
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (inAppBrowser) {
          toast.error(
            "لكي تستعمل خاصية تحديد الموقع . افتح هذا الرابط في المتصفح (chrome , safari ...)",
            { duration: 8000 }
          );
          return;
        }
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("ما عطيتش الإذن لتحديد الموقع. افتح الرابط في Chrome أو Safari إذا كنت في تطبيق آخر.");
        } else {
          toast.error("ما نجمناش نحدّدو موقعك، عاود من فضلك");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSubmit = async (values: HomePickupForm) => {
    setSubmitting(true);
    const { error } = await supabase.from("donations").insert({
      track: "shoulders",
      project_type: "Adha",
      full_name: values.full_name,
      phone: values.phone,
      pickup_required: true,
      pickup_method: "home",
      gps_location: values.gps_location,
    });
    setSubmitting(false);
    if (error) {
      toast.error("صار خطأ، عاود من فضلك");
      return;
    }
    navigate("/success");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="rounded-xl bg-secondary/15 border border-secondary/40 p-4 text-sm">
        <p className="font-bold mb-1">⚠️ ملاحظة هامة</p>
        <p className="text-muted-foreground">
          خدمة الاستلام متوفرة فقط في نطاق 10 كم من ساقية الدائر، بين الساعة 13:00 و 18:00.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">الاسم و اللقب *</Label>
          <Input id="full_name" {...form.register("full_name")} />
          {form.formState.errors.full_name && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.full_name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input id="phone" {...form.register("phone")} dir="ltr" />
          {form.formState.errors.phone && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="gps_location">رابط Google Maps *</Label>
          <div className="flex gap-2">
            <Input
              id="gps_location"
              {...form.register("gps_location")}
              placeholder="https://maps.google.com/..."
              dir="ltr"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={detectLocation}
              disabled={locating}
              className="shrink-0 gap-2"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
              {locating ? "جاري التحديد..." : "موقعي"}
            </Button>
          </div>
          {form.formState.errors.gps_location && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.gps_location.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="button" variant="outline" onClick={onBack}>رجوع</Button>
        <Button type="submit" disabled={submitting} className="flex-1 bg-primary text-primary-foreground py-6 text-base font-bold">
          {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          تأكيد طلب الاستلام
        </Button>
      </div>
    </form>
  );
};
