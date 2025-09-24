import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { RabbitMQService } from "./rabbitmq.service";

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, RabbitMQService],
})
export class NotificationModule {}
