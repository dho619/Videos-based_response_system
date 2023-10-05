import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CustomDialogProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description: string;
    footerContent?: React.ReactNode;
    open: boolean;
    onOpenChange: (value: boolean) => void;
}

export function CustomDialog(props: CustomDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[80vh]">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {props.children}
        </div>
        <DialogFooter>
          {props.footerContent}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
