import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private apiUrl = environment.backendUrl;

  constructor(private http: HttpClient) {}

  sendNotification(mensagemId: string, conteudoMensagem: string) {
    return this.http.post(`${this.apiUrl}/notificar`, {
      mensagemId,
      conteudoMensagem,
    });
  }

  getStatus(mensagemId: string) {
    return this.http.get<{ status: string }>(
      `${this.apiUrl}/notificar/status/${mensagemId}`
    );
  }
}
