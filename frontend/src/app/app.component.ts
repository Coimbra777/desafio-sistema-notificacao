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
  mensagemErro: string = "";
  notificacoes: Notificacao[] = [];

  constructor(private notificationService: NotificationService) {}

  enviar() {
    if (!this.conteudoMensagem || !this.conteudoMensagem.trim()) {
      this.mensagemErro = "Conteudo da mensagem obrigatório";
      return;
    }

    this.mensagemErro = "";

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
      .subscribe({
        next: () => this.pollStatus(mensagemId),
        error: (err) => {
          console.log(err);

          this.mensagemErro =
            err?.error?.error || "Erro ao enviar notificação.";
          this.notificacoes = this.notificacoes.filter(
            (n) => n.mensagemId !== mensagemId
          );
        },
      });
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
