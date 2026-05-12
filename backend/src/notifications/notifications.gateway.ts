import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*', // À affiner en production
  },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      // Rejoindre une "room" spécifique à l'utilisateur
      client.join(`user_${payload.sub}`);
      console.log(`Client connecté aux notifications: ${payload.sub}`);
    } catch (error) {
      console.error('Erreur de connexion socket:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client déconnecté des notifications');
  }

  // Méthode pour envoyer une notification à un utilisateur spécifique
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('newNotification', notification);
    this.server.to(`user_${userId}`).emit('unreadCountUpdate');
  }
}
