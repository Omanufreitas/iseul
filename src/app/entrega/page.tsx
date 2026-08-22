import {
  PolicyDoc,
  PolicyPageShell,
  policyMetadata,
} from "@/components/store/landing/PolicyPageShell";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = policyMetadata(
  "/entrega",
  "Prazo e forma de entrega",
  "Informações sobre envio e entrega de pedidos Iseul. Estoque no Brasil, despacho em 24h úteis."
);

export default function EntregaPage() {
  return (
    <PolicyPageShell title="Prazo e forma de entrega">
      <PolicyDoc>
        <h2>Envio</h2>
        <p>
          Pedidos com estoque no Brasil são despachados em até <b>24 horas úteis</b> após
          confirmação do pagamento, via transportadora parceira, com código de rastreio enviado por
          e-mail.
        </p>

        <h2>Recebimento</h2>
        <ul>
          <li>Confira a embalagem na entrega. Recuse se houver violação evidente.</li>
          <li>Guarde o comprovante de entrega até confirmar que está tudo certo com o pedido.</li>
        </ul>

        <h2>Contato</h2>
        <p>
          Dúvidas sobre entrega:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-iseul-ink underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </PolicyDoc>
    </PolicyPageShell>
  );
}
