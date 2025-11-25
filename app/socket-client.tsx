"use client"; 

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({
  children,
  serverUrl,
}: {
  children: React.ReactNode;
  serverUrl?: string;
}) => {
  
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
   
    const socketInstance = io(serverUrl || "", {
      path: "/api/socket", 
      transports: ["websocket"],
    });

   
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("✅ Connected to socket server:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
    });

  
    return () => {
      socketInstance.disconnect();
    };
  }, [serverUrl]); 
  console.log("SocketContext is", SocketContext);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
