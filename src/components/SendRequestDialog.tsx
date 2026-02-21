import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";

interface SendRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorName: string;
  campaignTitle?: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function SendRequestDialog({
  open,
  onOpenChange,
  creatorName,
  campaignTitle,
  onConfirm,
  isLoading = false,
}: SendRequestDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Collaboration Request</DialogTitle>
          <DialogDescription>
            You&apos;re about to send a collaboration request to{" "}
            <span className="font-semibold text-foreground">{creatorName}</span>
            .
          </DialogDescription>
        </DialogHeader>

        {campaignTitle && (
          <div className="py-4 px-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Campaign:</p>
            <p className="text-sm font-medium text-foreground">
              {campaignTitle}
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Once they accept your request, you&apos;ll be able to continue
          discussions on WhatsApp. This helps ensure genuine collaborations.
        </p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
