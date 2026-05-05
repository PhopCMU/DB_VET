"use client";

import { useEffect, useRef, useState } from "react";

interface SocketMessage {
  type: string;
  status: string;
  data: {
    transactionId: string;
    amount: number;
    payer: string;
    ref1: string;
    ref2: string;
    ref3: string;
    receivedAt: string;
  };
}

interface UseSocketOptions {
  ref2: string;
  apiKey: string;
  onMessage?: (message: SocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export const useScbSocket = ({
  ref2,
  apiKey,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseSocketOptions) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [messages, setMessages] = useState<SocketMessage[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const url = `wss://vmapi.vet.cmu.ac.th/scb/api/v1/ws?ref2=${encodeURIComponent(
      ref2
    )}&apiKey=${encodeURIComponent(apiKey)}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      //   console.log("✅ WebSocket connected");
      setIsConnected(true);
      setCountdown(600); // 10 นาที

      if (onOpen) onOpen();
    };

    ws.onclose = () => {
      //   console.log("❌ WebSocket disconnected");
      setIsConnected(false);
      if (timer) clearInterval(timer);
      setCountdown(null);
      setMessages([]);

      if (onClose) onClose();
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (onError) onError(error);
    };

    ws.onmessage = (event) => {
      try {
        const data: SocketMessage = JSON.parse(event.data);
        setMessages((prev) => [data, ...prev]);
        if (onMessage) onMessage(data);

        // 🚫 หยุด countdown + ปิด connection ทันที
        if (timer) clearInterval(timer);
        setCountdown(null);
        setTimeout(() => {
          ws.close();
        }, 5000);
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    // ⏳ ตั้งค่า countdown timer
    timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) {
          if (timer) clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setSocket(ws);

    return () => {
      if (timer) clearInterval(timer);
      ws.close();
    };
  }, [ref2, apiKey]);

  // ฟังก์ชันส่ง message (ถ้าจำเป็น)
  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  // แปลงวินาทีเป็น MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    isConnected,
    countdown,
    messages,
    sendMessage,
    formatTime,
    socket,
  };
};

export const useScbWebSocket = ({
  ref2,
  apiKey,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [messages, setMessages] = useState<SocketMessage[]>([]);

  // ✅ ใช้ useRef สำหรับเก็บค่าที่ไม่ต้อง trigger re-render และเข้าถึงได้ตลอด lifecycle
  const socketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ ฟังก์ชันเชื่อมต่อ
  const connect = () => {
    if (!ref2 || ref2.trim() === "" || !apiKey) {
      console.error("❌ ref2 and apiKey are required");
      return;
    }

    // 🧹 ปิดการเชื่อมต่อเก่าก่อน (ถ้ามี)
    disconnect();

    const url = `wss://vmapi.vet.cmu.ac.th/scb/api/v1/ws?ref2=${encodeURIComponent(
      ref2
    )}&apiKey=${encodeURIComponent(apiKey)}`;
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setCountdown(600); // 10 นาที

      // ✅ เริ่ม countdown timer ทันทีหลังเชื่อมต่อ
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            // ปิดอัตโนมัติเมื่อหมดเวลา (optional)
            disconnect();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      if (onOpen) onOpen();
    };

    ws.onclose = () => {
      setIsConnected(false);
      setCountdown(null);
      setMessages([]);
      if (onClose) onClose();
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (onError) onError(error);
    };

    ws.onmessage = (event) => {
      try {
        const data: SocketMessage = JSON.parse(event.data);
        setMessages((prev) => [data, ...prev]);
        if (onMessage) onMessage(data);

        // 🚫 หากต้องการปิดหลังได้รับข้อความ ให้ใช้ disconnect()
        // ตัวอย่าง: ปิดหลัง 5 วินาที
        // if (timerRef.current) clearInterval(timerRef.current);
        // setCountdown(null);
        // setTimeout(() => disconnect(), 5000);
      } catch (err) {
        console.error("WS parse error", err);
      }
    };
  };

  // ✅ ฟังก์ชันปิดการเชื่อมต่ออย่างปลอดภัย
  const disconnect = () => {
    // หยุด timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // ปิด WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    socketRef.current = null;

    // รีเซ็ต state
    setIsConnected(false);
    setCountdown(null);
    setMessages([]);
  };

  // ✅ ส่งข้อความ
  const sendMessage = (message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  // ✅ แปลงวินาทีเป็น MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 🧹 cleanup เมื่อ component ถูก unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    countdown,
    messages,
    sendMessage,
    formatTime,
    connect,
    disconnect,
    // ไม่จำเป็นต้อง expose socket เพราะใช้ผ่าน ref แล้ว
  };
};

/*
export const useScbWebSocket = ({
  ref2,
  apiKey,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseSocketOptions) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [messages, setMessages] = useState<SocketMessage[]>([]);

  // ฟังก์ชันสำหรับเชื่อมต่อ
  const connect = () => {
    if (!ref2 || ref2.trim() === "") {
      console.error("❌ ref2 is required");
      return;
    }
    let timer: NodeJS.Timeout | null = null;

    const url = `wss://vmapi.vet.cmu.ac.th/scb/api/v1/ws?ref2=${encodeURIComponent(
      ref2
    )}&apiKey=${encodeURIComponent(apiKey)}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      //   console.log("✅ WebSocket connected");
      setIsConnected(true);
      setCountdown(600); // 10 นาที

      if (onOpen) onOpen();
    };

    ws.onclose = () => {
      //   console.log("❌ WebSocket disconnected");
      setIsConnected(false);
      if (timer) clearInterval(timer);
      setCountdown(null);
      setMessages([]);

      if (onClose) onClose();
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (onError) onError(error);
    };

    ws.onmessage = (event) => {
      try {
        const data: SocketMessage = JSON.parse(event.data);
        setMessages((prev) => [data, ...prev]);
        if (onMessage) onMessage(data);

        // 🚫 อย่าปิดทันที!
        // ws.close();
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    // ⏳ ตั้งค่า countdown timer
    timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) {
          if (timer) clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setSocket(ws);

    return () => {
      if (timer) clearInterval(timer);
      ws.close();
    };
  };

  // ฟังก์ชันสำหรับปิด connection
  const disconnect = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  };

  // ฟังก์ชันส่ง message (ถ้าจำเป็น)
  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  // แปลงวินาทีเป็น MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    isConnected,
    countdown,
    messages,
    sendMessage,
    formatTime,
    socket,
    connect, // ✅ เพิ่มฟังก์ชันนี้
    disconnect, // ✅ เพิ่มฟังก์ชันนี้
  };
};
*/
