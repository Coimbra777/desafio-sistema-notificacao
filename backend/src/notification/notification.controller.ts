import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { NotificationService } from "./notification.service";
import { RabbitMQService } from "./rabbitmq.service";

@Controller("notificar")
export class NotificationController {
  private inQueue =
    process.env.IN_QUEUE || "fila.notificacao.entrada.gabrielcoimbra";

  constructor(
    private readonly rabbit: RabbitMQService,
    private readonly notificationService: NotificationService
  ) {}

  @Post()
  async notificar(@Body() body: any, @Res() res: Response) {
    const { mensagemId, conteudoMensagem } = body;
    if (!mensagemId || !conteudoMensagem?.trim()) {
      return res
        .status(400)
        .json({ error: "mensagemId e conteudoMensagem são obrigatórios" });
    }

    this.notificationService.setStatus(mensagemId, "AGUARDANDO_PROCESSAMENTO");
    this.rabbit.publishInQueue(this.inQueue, { mensagemId, conteudoMensagem });

    return res
      .status(202)
      .json({ mensagemId, status: "AGUARDANDO_PROCESSAMENTO" });
  }

  @Get("status/:id")
  getStatus(@Param("id") id: string, @Res() res: Response) {
    const status = this.notificationService.getStatus(id);
    if (!status) {
      return res.status(404).json({ mensagemId: id, status: "NAO_ENCONTRADO" });
    }
    return res.json({ mensagemId: id, status });
  }
}
