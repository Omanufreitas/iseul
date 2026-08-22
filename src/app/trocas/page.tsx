import {
  PolicyDoc,
  PolicyPageShell,
  policyMetadata,
} from "@/components/store/landing/PolicyPageShell";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = policyMetadata(
  "/trocas",
  "Trocas e devoluções",
  "Política de trocas e devoluções da Iseul. Prazo de 7 dias, produtos lacrados e condições de reembolso."
);

export default function TrocasPage() {
  return (
    <PolicyPageShell title="Trocas e devoluções">
      <PolicyDoc>
        <p>
          Esta política vale para compras feitas em <b>iseul.com.br</b>, operado por{" "}
          <b>Comercio Varejista Zepfit Wellness Ltda</b> (CNPJ 63.829.102/0001-34).
        </p>

        <h2>Direito de arrependimento</h2>
        <p>
          Pelo Código de Defesa do Consumidor, você pode desistir da compra em até{" "}
          <b>7 dias corridos</b> após o recebimento, sem precisar justificar. O produto deve estar{" "}
          <b>lacrado, sem uso e na embalagem original</b>.
        </p>

        <h2>Trocas por defeito ou divergência</h2>
        <p>
          Se o produto chegar com avaria, vencimento impróprio ou diferente do pedido, entre em
          contato em até <b>7 dias</b> pelo e-mail{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-iseul-ink underline">
            {CONTACT_EMAIL}
          </a>{" "}
          com fotos do item e da embalagem. Providenciamos troca ou reembolso integral, incluindo
          frete de devolução quando aplicável.
        </p>

        <h2>Como solicitar</h2>
        <ul>
          <li>Envie o número do pedido e o motivo da solicitação.</li>
          <li>Aguarde a autorização antes de postar a devolução.</li>
          <li>Use embalagem segura; produtos danificados por mau acondicionamento na devolução podem ter o reembolso reduzido.</li>
        </ul>

        <h2>Reembolso</h2>
        <p>
          Após recebermos e conferirmos o produto, o reembolso é feito pelo mesmo meio de pagamento
          em até <b>10 dias úteis</b>. Compras no cartão podem aparecer na fatura seguinte,
          conforme a operadora.
        </p>

        <h2>Produtos abertos</h2>
        <p>
          Por higiene, produtos de skincare <b>abertos ou usados</b> não entram em troca por
          arrependimento. Defeito de fabricação com embalagem violada é analisado caso a caso.
        </p>

        <h2>Contato</h2>
        <p>
          Dúvidas:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-iseul-ink underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </PolicyDoc>
    </PolicyPageShell>
  );
}
