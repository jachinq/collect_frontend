import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button";
import { MessageSquareWarning } from "lucide-react";

export const Confirm = (
  {
    trigger = <Button variant="ghost">Open Confirm</Button>,
    onCancel = () => {},
    onConfirm = () => {},
    message = "",
    title = "Confirm",
    icon = <MessageSquareWarning className="inline mr-2" />,
  }: React.HTMLAttributes<HTMLDivElement> & {
    trigger?: React.ReactNode;
    onCancel?: () => void;
    onConfirm?: () => void;
    message?: string;
    title?: string;
    icon?: React.ReactNode;
  }
) => {
  return <AlertDialog>
  <AlertDialogTrigger asChild>
    {trigger}
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle className="text-destructive">{icon}{title}</AlertDialogTitle>
      <AlertDialogDescription>{message}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={onCancel}>取消</AlertDialogCancel>
      <AlertDialogAction onClick={onConfirm}>确认</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
};