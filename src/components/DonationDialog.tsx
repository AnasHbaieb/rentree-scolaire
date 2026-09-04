import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FinancialDonationForm } from "./FinancialDonationForm";
import { ShouldersDonationForm } from "./ShouldersDonationForm";

type Track = "financial" | "shoulders" | null;

export const DonationDialog = ({
  open,
  onOpenChange,
  initialTrack,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialTrack?: Track;
}) => {
  const [track, setTrack] = useState<Track>(initialTrack ?? null);

  useEffect(() => {
    if (open) {
      setTrack(initialTrack ?? null);
    }
  }, [open, initialTrack]);

  // reset when closed
  const handleOpenChange = (v: boolean) => {
    if (!v) setTrack(null);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-arabic-display text-primary">
            أسهم الأمل
          </DialogTitle>
        </DialogHeader>

        {track === "financial" && (
          <FinancialDonationForm onBack={() => setTrack(initialTrack ?? null)} />
        )}
        {track === "shoulders" && (
          <ShouldersDonationForm onBack={() => setTrack(initialTrack ?? null)} />
        )}
      </DialogContent>
    </Dialog>
  );
};
