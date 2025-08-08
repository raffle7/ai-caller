"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  receipt: {
    item: string;
    price: string;
    status: string;
    thankYouNote: string;
  } | null;
}

export default function ReceiptModal({ open, onClose, receipt }: ReceiptModalProps) {
  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order Receipt</DialogTitle>
          <DialogDescription>
            Here’s a summary of your confirmed order.
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-md p-4 space-y-2 bg-muted">
          <div className="flex justify-between">
            <span className="font-medium">Item</span>
            <span>{receipt.item}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Price</span>
            <span>{receipt.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status</span>
            <span className={receipt.status === "Confirmed" ? "text-green-600 font-semibold" : ""}>
              {receipt.status}
            </span>
          </div>
          <div className="pt-2 border-t text-sm text-gray-600">
            {receipt.thankYouNote}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
