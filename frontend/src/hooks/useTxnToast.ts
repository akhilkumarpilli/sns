// hooks/useTransactionToast.ts
import { toast } from "sonner";

export const useTransactionToast = () => {
  const transactionToast = (signature: string) => {
    toast.success("Transaction successful", {
      description: `Signature: ${signature}`,
      // Optional: action button to view in explorer
      action: {
        label: "View",
        onClick: () => {
          window.open(`https://explorer.solana.com/tx/${signature}`, "_blank");
        },
      },
    });
  };

  return transactionToast;
};
