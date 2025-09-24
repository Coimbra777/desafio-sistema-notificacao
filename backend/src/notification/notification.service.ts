import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationService {
  private statusMap: Map<string, string> = new Map();

  setStatus(id: string, status: string) {
    this.statusMap.set(id, status);
  }

  getStatus(id: string): string | null {
    return this.statusMap.get(id) || null;
  }
}
