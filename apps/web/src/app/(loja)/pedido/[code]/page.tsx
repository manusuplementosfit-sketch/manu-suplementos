import { Suspense } from "react";
import { PageLoader } from "@/components/ui/spinner";
import { OrderTracking } from "./order-tracking";

export default function OrderPage() {
  return (
    <Suspense fallback={<PageLoader label="Carregando pedido" />}>
      <OrderTracking />
    </Suspense>
  );
}
