import { describe, expect, it } from "vitest";
import { archiveCopyRecipient, archiveCopySubject } from "@/lib/email/mailer";

describe("cópia interna dos e-mails", () => {
  it("manda cópia para o e-mail da Iseul", () => {
    expect(archiveCopyRecipient("cliente@gmail.com")).toBe("contato@iseul.com.br");
  });

  it("não duplica quando o destinatário já é a Iseul", () => {
    expect(archiveCopyRecipient("contato@iseul.com.br")).toBeNull();
    expect(archiveCopyRecipient("  CONTATO@ISEUL.COM.BR  ")).toBeNull();
  });

  it("marca o assunto da cópia com o e-mail da cliente", () => {
    expect(archiveCopySubject("Pedido #12 confirmado · Iseul", "marina@email.com")).toBe(
      "Cópia · Pedido #12 confirmado · Iseul · marina@email.com",
    );
  });
});
