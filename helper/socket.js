import { io } from 'socket.io-client'


/** @type {import("socket.io-client").Socket | null} */
let socket = null

/**
 * 
 * @returns {string} 
 */
export const getServerUrl = () => {
    if (typeof window === 'undefined') return
    return (
        process.env.NEXT_PUBLIC_CHAT_SERVER_URL || ''
    )
}


/**
 * @param {{ serverUrl  : string }} params 
 * @returns {SocketInstance}
 */
export const getSocket = ({ serverUrl }) => {
    if (!socket) {
        socket = io(serverUrl, {
            autoConnect: false,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 30000,
            transports: ['websocket', 'polling'],

        })
    }

    return socket;
}



/**
 * @returns {() => void}
 */
export const destroySocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null;
    }

}