import { useEffect, useRef, useState } from "react";

type PaymentMessage = {
  status: "connected" | "success" | "timeout";
  message: string;
  transactionId?: string;
  amount?: number;
};

export const usePaymentSSE = (
  ref2: string | null,
  onSuccess: (data: PaymentMessage) => void,
  onTimeout: (data: PaymentMessage) => void
) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentRef2Ref = useRef<string | null>(null);
  const retryCountRef = useRef<number>(0);

  const MAX_RETRY = 5;
  const RETRY_DELAY = 5000;

  useEffect(() => {
    if (!ref2 || ref2 === currentRef2Ref.current) return;
    currentRef2Ref.current = ref2;
    retryCountRef.current = 0;

    const startSSE = () => {
      if (!currentRef2Ref.current) return;

      // ปิด EventSource เก่า
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const url = `https://vmapi.vet.cmu.ac.th/scb/api/v1/payment/stream?ref2=${encodeURIComponent(
        currentRef2Ref.current
      )}`;
      console.log("🔗 SSE | Connecting to", url);

      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () =>
        console.log("📡 SSE connected for ref2:", currentRef2Ref.current);

      es.onmessage = (event) => {
        try {
          const data: PaymentMessage = JSON.parse(event.data);
          console.log("📩 SSE DATA:", data);

          if (data.status === "success") {
            onSuccess(data);
            es.close();
            eventSourceRef.current = null;
          } else if (data.status === "timeout") {
            onTimeout(data);
            es.close();
            eventSourceRef.current = null;
          }
        } catch (err) {
          console.error("❌ SSE parse error:", err);
        }
      };

      es.onerror = () => {
        console.warn("⚠️ SSE error, will retry...");
        es.close();
        eventSourceRef.current = null;

        if (retryCountRef.current < MAX_RETRY) {
          retryTimerRef.current = setTimeout(() => {
            retryCountRef.current += 1;
            startSSE();
          }, RETRY_DELAY);
        }
      };
    };

    startSSE();

    return () => {
      // cleanup
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [ref2, onSuccess, onTimeout]);
};
