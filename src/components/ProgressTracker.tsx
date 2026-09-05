import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Users, Target } from "lucide-react";

const GOAL = 28000;

export const ProgressTracker = () => {
  const [total, setTotal] = useState(0);
  const [donors, setDonors] = useState(0);

  const fetchTotal = async () => {
    const { data, error } = await supabase.rpc("get_donation_total");
    if (!error && data && data.length > 0) {
      setTotal(Number(data[0].total_amount) || 0);
      setDonors(Number(data[0].donor_count) || 0);
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

  return (
    <div className="w-full max-w-3xl mx-auto bg-card border border-border rounded-2xl p-6 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">المبلغ المجمّع</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-primary">
            {total.toLocaleString("ar-TN")} <span className="text-lg text-muted-foreground">د.ت</span>
          </div>
        </div>
        <div className="text-left">
          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1 justify-end">
            <Target className="h-4 w-4" /> الهدف
          </div>
          <div className="text-2xl font-bold text-secondary">
            {GOAL.toLocaleString("ar-TN")} د.ت
          </div>
        </div>
      </div>
      <Progress value={percentage} className="h-4" />
      <div className="flex items-center justify-between mt-3 text-sm">
        <span className="font-bold text-primary">{percentage.toFixed(1)}%</span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-4 w-4" /> {donors} مساهم
        </span>
      </div>
    </div>
  );
};
