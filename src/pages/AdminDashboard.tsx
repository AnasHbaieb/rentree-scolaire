import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, Download, RefreshCw, Coins, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Donation {
  id: string;
  created_at: string;
  track: "financial" | "shoulders";
  full_name: string;
  phone: string;
  amount: number | null;
  payment_method: string | null;
  pickup_method: string | null;
  pickup_time: string | null;
  gps_location: string | null;
  status: "pending" | "collected";
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "financial" | "shoulders">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/admin");
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        toast.error("ما عندكش صلاحيات الإدارة");
        navigate("/admin");
        return;
      }
      setAuthChecked(true);
      fetchDonations();
    });
  }, [navigate]);

  const fetchDonations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("ما نجمناش نقراو المعطيات");
    } else {
      setDonations((data ?? []) as Donation[]);
    }
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const toggleStatus = async (d: Donation) => {
    const newStatus = d.status === "pending" ? "collected" : "pending";
    const { error } = await supabase
      .from("donations")
      .update({ status: newStatus })
      .eq("id", d.id);
    if (error) {
      toast.error("ما نجمناش نحدّثو الحالة");
      return;
    }
    setDonations((prev) =>
      prev.map((x) => (x.id === d.id ? { ...x, status: newStatus } : x))
    );
  };

  const exportCsv = () => {
    const trackMap: Record<string, string> = { financial: "مالية", shoulders: "أكتاف" };
    const paymentMap: Record<string, string> = { cash: "نقدي", transfer: "تحويل بنكي", check: "صك بنكي" };
    const pickupMap: Record<string, string> = { home: "بيت", headquarters: "مقر" };
    const statusMap: Record<string, string> = { pending: "في الانتظار", collected: "مؤكدة" };
    const headers = [
      "التاريخ", "النوع", "الاسم", "الهاتف", "المبلغ", "طريقة الدفع", "طريقة الاستلام", "وقت الاستلام", "الموقع", "الحالة",
    ];
    const rows = donations.map((d) => [
      new Date(d.created_at).toLocaleString("ar-TN"),
      trackMap[d.track] ?? d.track,
      d.full_name,
      d.phone,
      d.amount ? `${d.amount} د` : "-",
      d.payment_method ? (paymentMap[d.payment_method] ?? d.payment_method) : "-",
      d.pickup_method ? (pickupMap[d.pickup_method] ?? d.pickup_method) : "-",
      d.pickup_time ?? "-",
      d.gps_location ?? "-",
      statusMap[d.status] ?? d.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = donations.filter((d) => filter === "all" || d.track === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalFinancial = donations
    .filter((d) => d.track === "financial")
    .reduce((s, d) => s + Number(d.amount ?? 0), 0);
  const totalDonors = donations.filter((d) => d.track === "financial").length;

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>لوحة الإدارة - أسهم الأمل</title>
        <meta name="description" content="لوحة إدارة التبرعات وصدقات الأكتاف لحملة أسهم الأمل الخاصة بجمعية الكلمة الطيبة." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://rentree-scolaire.lovable.app/admin/dashboard" />
      </Helmet>
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-primary">لوحة الإدارة</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchDonations}>
              <RefreshCw className="h-4 w-4 ml-1" /> تحديث
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4 ml-1" /> تصدير CSV
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 ml-1" /> خروج
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatCard icon={Coins} label="مجموع التبرعات" value={`${totalFinancial.toLocaleString("ar-TN")} د.ت`} />
          <StatCard icon={Users} label="عدد المساهمين" value={String(totalDonors)} />
        </div>

        <div className="flex gap-2 mb-4">
          {([
            ["all", "الكل"],
            ["financial", "مالية"],
            ["shoulders", "عينية"],
          ] as const).map(([k, label]) => (
            <Button
              key={k}
              variant={filter === k ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilter(k); setPage(1); }}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>التفاصيل</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        لا توجد مساهمات بعد
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(d.created_at).toLocaleString("ar-TN")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.track === "financial" ? "default" : "secondary"}>
                            {d.track === "financial" ? "مالية" : "عينية"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{d.full_name}</TableCell>
                        <TableCell dir="ltr" className="text-sm">{d.phone}</TableCell>
                        <TableCell className="font-bold">
                          {d.amount ? `${d.amount} د` : "-"}
                        </TableCell>
                        <TableCell className="text-xs max-w-[220px]">
                          {d.payment_method && <div>دفع: {d.payment_method === "cash" ? "نقدي" : d.payment_method === "transfer" ? "تحويل بنكي" : d.payment_method === "check" ? "صك بنكي" : d.payment_method}</div>}
                          {d.pickup_method && <div>استلام: {d.pickup_method === "home" ? "بيت" : "مقر"}</div>}
                          {d.pickup_time && <div>وقت: {d.pickup_time}</div>}
                          {d.gps_location && (
                            <a
                              href={d.gps_location}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline truncate block"
                            >
                              📍 الموقع
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleStatus(d)}
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              d.status === "collected"
                                ? "bg-primary/15 text-primary"
                                : "bg-secondary/20 text-secondary-foreground"
                            }`}
                          >
                            {d.status === "collected" ? "مؤكدة ✓" : "في الانتظار"}
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-center mt-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="التالي"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                صفحة {currentPage} من {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full border border-border"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="السابق"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
