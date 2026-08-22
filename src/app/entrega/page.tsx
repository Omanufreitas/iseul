import {
  PolicyDoc,
  PolicyPageShell,
  policyMetadata,
} from "@/components/store/landing/PolicyPageShell";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = policyMetadata(
  "/entrega",
  "Prazo e forma de entrega",
  "Informações sobre prazo, frete e entrega de pedidos Iseul. Alguns valores aguardam confirmação."
);

export default function EntregaPage() {
  return (
    <PolicyPageShell title="Prazo e forma de entrega">
      <PolicyDoc>
        <p className="rounded-sm border border-iseul-line bg-iseul-areia p-4 text-sm">
          <b>Atenção:</b> prazos por região, tabela de frete por faixa de CEP e valor mínimo para
          frete grátis estão sendo finalizados e serão publicados em breve. Até lá, os valores
          abaixo são referência operacional e podem ser ajustados antes da abertura da loja.
        </p>

        <h2>Envio</h2>
        <p>
          Pedidos com estoque no Brasil são despachados em até <b>24 horas úteis</b> após
          confirmação do pagamento, via transportadora parceira, com código de rastreio enviado por
          e-mail.
        </p>

        <h2>Frete</h2>
        <p>
          <b>[Pendente]</b> Valor do frete por faixa de CEP — aguardando confirmação comercial.
        </p>
        <p>
          <b>[Pendente]</b> Valor mínimo para frete grátis — aguardando confirmação comercial.
        </p>

        <h2>Prazo estimado por região</h2>
        <p>
          <b>[Pendente]</b> Tabela de prazos por região (Sudeste, Sul, Centro-Oeste, Nordeste,
          Norte) — aguardando confirmação logística.
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
