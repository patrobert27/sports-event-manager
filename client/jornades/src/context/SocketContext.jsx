import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { selectAuth } from '../features/auth/authSelectors';

const SocketContext = createContext(null);

/**
 * Hook para usar el socket en cualquier componente
 */
export const useSocket = () => useContext(SocketContext);

/**
 * Proveedor de Sockets
 * Maneja la conexión y desconexión automática basada en el token de Redux.
 * Gestiona reconnexió i neteja de recursos correctament.
 */
export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useSelector(selectAuth);
  const [socket, setSocket] = useState(null);
  // Ref per evitar closures stale al cleanup
  const socketRef = useRef(null);

  useEffect(() => {
    // Solo conectamos si el usuario está autenticado y tenemos un token
    if (isAuthenticated && token) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL;
      const newSocket = io(socketUrl, {
        auth: { token },
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Limpieza al desmontar o al cambiar el estado de auth
      return () => {
        newSocket.removeAllListeners();
        newSocket.close();
        socketRef.current = null;
      };
    } else {
      // Si el usuario hace logout, cerramos el socket usando la ref (evita stale closure)
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
      }
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
