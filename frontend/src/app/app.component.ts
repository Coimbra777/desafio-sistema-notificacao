import { Component } from "@angular/core";
import { NotificationService } from "./services/notification.service";
import { v4 as uuidv4 } from "uuid";

interface Notificacao {
  mensagemId: string;
  conteudoMensagem: string;
  status: string;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent {
  conteudoMensagem = "";
  notificacoes: Notificacao[] = [];

  constructor(private notificationService: NotificationService) {}

  enviar() {
    if (!this.conteudoMensagem.trim()) return;

    const mensagemId = uuidv4();
    const notificacao: Notificacao = {
      mensagemId,
      conteudoMensagem: this.conteudoMensagem,
      status: "AGUARDANDO_PROCESSAMENTO",
    };

    this.notificacoes.push(notificacao);
    this.conteudoMensagem = "";

    this.notificationService
      .sendNotification(mensagemId, notificacao.conteudoMensagem)
      .subscribe(() => this.pollStatus(mensagemId));
  }

  pollStatus(mensagemId: string) {
    const interval = setInterval(() => {
      this.notificationService.getStatus(mensagemId).subscribe((res) => {
        const notif = this.notificacoes.find(
          (n) => n.mensagemId === mensagemId
        );
        if (notif) notif.status = res.status;
        if (res.status !== "AGUARDANDO_PROCESSAMENTO") clearInterval(interval);
      });
    }, 1000);
  }
}
