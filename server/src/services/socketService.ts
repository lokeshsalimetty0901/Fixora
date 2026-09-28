import { Server as SocketIOServer, Socket } from 'socket.io';

export const setupSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket Client Connected: ${socket.id}`);

    // Join room (for booking real-time updates or user specific channel)
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`📌 Socket ${socket.id} joined room ${roomId}`);
    });

    // Leave room
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`🚪 Socket ${socket.id} left room ${roomId}`);
    });

    // Stream live professional GPS location updates to customer room
    socket.on('update_location', (data: { bookingId: string; latitude: number; longitude: number }) => {
      console.log(`📍 Location update for booking ${data.bookingId}:`, data.latitude, data.longitude);
      io.to(`booking_${data.bookingId}`).emit('location_updated', {
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date().toISOString(),
      });
    });

    // Stream booking status changes
    socket.on('update_booking_status', (data: { bookingId: string; status: string }) => {
      console.log(`🔄 Status update for booking ${data.bookingId}:`, data.status);
      io.to(`booking_${data.bookingId}`).emit('status_changed', {
        status: data.status,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket Client Disconnected: ${socket.id}`);
    });
  });
};
