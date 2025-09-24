import { Injectable, OnModuleInit } from "@nestjs/common";
import amqp from "amqplib";
import { NotificationService } from "./notification.service";

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private channel!: amqp.Channel;

  constructor(private readonly notificationService: NotificationService) {}

  async onModuleInit() {
    const url =
      process.env.BACKEND_RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672/";
    const inQueue =
      process.env.IN_QUEUE || "fila.notificacao.entrada.gabrielcoimbra";
    const outQueue =
      process.env.OUT_QUEUE || "fila.notificacao.status.gabrielcoimbra";

    let connected = false;
    let retries = 10;
    while (!connected && retries > 0) {
      try {
        const conn = await amqp.connect(url);
        this.channel = await conn.createChannel();
        await this.channel.assertQueue(inQueue, { durable: true });
        await this.channel.assertQueue(outQueue, { durable: true });

        connected = true;

        // Consumer
        this.channel.consume(
          inQueue,
          async (msg: amqp.ConsumeMessage | null) => {
            if (!msg) return;
            const payload = JSON.parse(msg.content.toString());
            const mensagemId = payload.mensagemId;

            await new Promise((res) =>
              setTimeout(res, 1000 + Math.random() * 1000)
            );
            const status =
              Math.random() <= 0.2
                ? "FALHA_PROCESSAMENTO"
                : "PROCESSADO_SUCESSO";

            this.notificationService.setStatus(mensagemId, status);
            this.channel.sendToQueue(
              outQueue,
              Buffer.from(JSON.stringify({ mensagemId, status })),
              { persistent: true }
            );
            this.channel.ack(msg);
          }
        );

        console.log("Conectado ao RabbitMQ!");
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.log(
            "RabbitMQ não disponível, retry em 2s...",
            retries,
            err.message
          );
        } else {
          console.log("RabbitMQ não disponível, retry em 2s...", retries, err);
        }
      }
    }

    if (!connected) {
      throw new Error(
        "Não foi possível conectar ao RabbitMQ após várias tentativas"
      );
    }
  }

  publishInQueue(queue: string, payload: any) {
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
  }
}
