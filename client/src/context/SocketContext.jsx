import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated() && user) {
            const newSocket = io('http://localhost:5001', {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('[Socket] Connected');

                // Join rooms based on role
                if (user.role === 'customer') {
                    newSocket.emit('join:user', user.id);
                    console.log(`[Socket] Joining room: user:${user.id}`);
                } else if ((user.role === 'staff' || user.role === 'owner') && user.restaurant) {
                    newSocket.emit('join:restaurant', user.restaurant);
                    console.log(`[Socket] Joining room: restaurant:${user.restaurant}`);
                }
            });

            newSocket.on('disconnect', () => {
                console.log('[Socket] Disconnected');
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [isAuthenticated, user?.id]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
