import { Suspense } from "react";
import { OrderTracking } from "./order-tracking";

export default function OrderPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-10 text-zinc-500">Carregando pedido…</p>}>
      <OrderTracking />
    </Suspense>
  );
}
