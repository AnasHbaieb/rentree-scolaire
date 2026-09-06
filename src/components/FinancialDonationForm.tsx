import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { financialSchema, type FinancialForm } from "@/lib/donation-schemas";
import { Loader2, Banknote, Building2, FileCheck, Copy } from "lucide-react";

const PRESETS = [50];

export const FinancialDonationForm = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(50);
  const [customAmount, setCustomAmount] = useState("");

  const form = useForm<FinancialForm>({
    resolver: zodResolver(financialSchema),
    defaultValues: { full_name: "", phone: "", amount: 50, payment_method: "cash" },
  });

  const handlePreset = (val: number | "custom") => {
    setSelectedPreset(val);
    if (val !== "custom") {
      form.setValue("amount", val, { shouldValidate: true });
    } else {
      form.setValue("amount", Number(customAmount) || 0);
    }
  };

  const onSubmit = async (values: FinancialForm) => {
    setSubmitting(true);
    const { error } = await supabase.from("donations").insert({
      track: "financial",
      project_type: "Rentree",
      full_name: values.full_name,
      phone: values.phone,
      amount: values.amount,
      payment_method: values.payment_method,
      pickup_required: false,
    });
    setSubmitting(false);
    if (error) {
      toast.error("صار خطأ، عاود من فضلك");
      return;
    }
    navigate("/success");
  };

  const paymentMethod = form.watch("payment_method");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label className="text-base font-bold mb-3 block">قَدّ السهم</Label>
        <div className="grid grid-cols-3 gap-3">
          {PRESETS.map((val) => (
            <button
              type="button"
              key={val}
              onClick={() => handlePreset(val)}
              className={`rounded-xl border-2 py-4 text-center font-bold transition-all ${
                selectedPreset === val
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              {val} د
            </button>
          ))}
          <button
            type="button"
            onClick={() => handlePreset("custom")}
            className={`rounded-xl border-2 py-4 text-center font-bold transition-all ${
              selectedPreset === "custom"
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            مبلغ حر
          </button>
        </div>
        {selectedPreset === "custom" && (
          <Input
            type="number"
            min={1}
            aria-label="المبلغ المخصص بالدينار"
            placeholder="المبلغ بالدينار"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              form.setValue("amount", Number(e.target.value) || 0, { shouldValidate: true });
            }}
            className="mt-3"
          />
        )}
        {form.formState.errors.amount && (
          <p className="text-destructive text-sm mt-2">{form.formState.errors.amount.message}</p>
        )}
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

      <div>
        <Label className="text-base font-bold mb-3 block">طريقة الدفع</Label>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(v) => form.setValue("payment_method", v as FinancialForm["payment_method"])}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {[
            { val: "cash", label: "نقدي", icon: Banknote },
            { val: "transfer", label: "تحويل بنكي", icon: Building2 },
            { val: "check", label: "صك بنكي", icon: FileCheck },
          ].map(({ val, label, icon: Icon }) => (
            <label
              key={val}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                paymentMethod === val ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              }`}
            >
              <RadioGroupItem value={val} className="sr-only" />
              <Icon className="h-5 w-5 text-primary" />
              <span className="font-medium">{label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {paymentMethod === "transfer" && (
        <div className="rounded-xl bg-muted/60 p-4 text-sm space-y-3">
          <p className="text-center font-bold text-primary">رقم الحساب البريدي (RIB)</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("17701000000177554445");
                toast.success("تم نسخ الـ RIB");
              }}
              className="shrink-0 rounded-lg border border-border bg-card p-2 hover:bg-muted transition"
              aria-label="نسخ"
            >
              <Copy className="h-4 w-4" />
            </button>
            <div dir="ltr" className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-center font-mono tracking-wider">
              17701000000177554445
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card px-3 py-2 text-center font-medium">
            ASS DE CHARITE EL KALIMA ETTAYBA
          </div>
        </div>
      )}
      {paymentMethod === "check" && (
        <div className="rounded-xl bg-muted/60 p-4 text-sm">
          <p className="font-bold mb-1">دفع بالصك البنكي</p>
          <p className="text-muted-foreground">يتم استلام الصك في المقر بساقية الدائر أو بتنسيق مع الفريق.</p>
        </div>
      )}
      {paymentMethod === "cash" && (
        <div className="rounded-xl bg-muted/60 p-4 text-sm">
          <p className="font-bold mb-1">الدفع نقدي</p>
          <p className="text-muted-foreground">فريق الإدارة سيتصل بك لتنسيق الاستلام في أقرب وقت.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="submit" disabled={submitting} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-base">
          {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          تأكيد المساهمة
        </Button>
      </div>
    </form>
  );
};
