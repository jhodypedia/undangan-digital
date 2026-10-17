"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AlertTriangle, HelpCircle, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmTone = "danger" | "warning" | "default";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

type ConfirmRequest = ConfirmOptions & {
  id: number;
  resolve: (value: boolean) => void;
};

const ConfirmContext = createContext<(options: ConfirmOptions) => Promise<boolean>>(
  async () => false,
);

export function useConfirm() {
  return useContext(ConfirmContext);
}

const TONE_META: Record<
  ConfirmTone,
  { variant: "destructive" | "default"; icon: typeof Trash2; ring: string }
> = {
  danger: {
    variant: "destructive",
    icon: Trash2,
    ring: "bg-destructive/12 text-destructive",
  },
  warning: {
    variant: "default",
    icon: AlertTriangle,
    ring: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  default: {
    variant: "default",
    icon: HelpCircle,
    ring: "bg-primary/12 text-primary",
  },
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const idRef = useRef(0);
  const pendingRef = useRef<ConfirmRequest | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      idRef.current += 1;
      const next = { ...options, id: idRef.current, resolve };
      pendingRef.current = next;
      setRequest(next);
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    pendingRef.current?.resolve(value);
    pendingRef.current = null;
    setRequest(null);
  }, []);

  const meta = TONE_META[request?.tone ?? "default"];
  const Icon = meta.icon;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={Boolean(request)}
        onOpenChange={(open) => {
          if (!open) settle(false);
        }}
      >
        <AlertDialogContent
          key={request?.id}
          className="gap-5 data-[size=default]:sm:max-w-md"
        >
          <AlertDialogHeader className="place-items-start text-left">
            <AlertDialogMedia className={meta.ring}>
              <Icon />
            </AlertDialogMedia>
            <AlertDialogTitle className="font-display text-lg">
              {request?.title}
            </AlertDialogTitle>
            {request?.description ? (
              <AlertDialogDescription>{request.description}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="sm:flex-none">
              {request?.cancelLabel ?? "Batal"}
            </AlertDialogCancel>
            <Button
              type="button"
              variant={meta.variant}
              onClick={() => settle(true)}
            >
              {request?.confirmLabel ?? "Ya, lanjutkan"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
