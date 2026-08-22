import {
  PolicyDoc,
  PolicyPageShell,
  policyMetadata,
} from "@/components/store/landing/PolicyPageShell";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = policyMetadata(
  "/privacidade",
  "Política de privacidade",
  "Como a Iseul coleta, usa e protege seus dados pessoais, em conformidade com a LGPD."
);

export default function PrivacidadePage() {
  return (
    <PolicyPageShell title="Política de privacidade">
      <PolicyDoc>
        <p>
          A <b>Iseul</b>, operada por <b>Comercio Varejista Zepfit Wellness Ltda</b> (CNPJ
          63.829.102/0001-34), trata dados pessoais conforme a Lei Geral de Proteção de Dados
          (Lei nº 13.709/2018).
        </p>

        <h2>Quem somos</h2>
        <p>
          Controladora: Comercio Varejista Zepfit Wellness Ltda · CNPJ 63.829.102/0001-34 ·{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-iseul-ink underline">
            {CONTACT_EMAIL}
          </a>
        </p>

        <h2>Dados que coletamos</h2>
        <ul>
          <li>
            <b>Cadastro e compra:</b> nome, e-mail, CPF, telefone, endereço de entrega e histórico
            de pedidos.
          </li>
          <li>
            <b>Lista de espera:</b> e-mail informado voluntariamente para aviso de abertura da loja.
          </li>
          <li>
            <b>Navegação:</b> cookies essenciais, endereço IP, dispositivo e páginas visitadas, para
            segurança e métricas agregadas.
          </li>
          <li>
            <b>Pagamento:</b> dados processados diretamente pelo gateway (Asaas/Mercado Pago); não
            armazenamos número completo de cartão.
          </li>
        </ul>

        <h2>Finalidades</h2>
        <ul>
          <li>Processar pedidos, entregas, trocas e suporte.</li>
          <li>Enviar comunicações transacionais (confirmação, rastreio, nota fiscal).</li>
          <li>Enviar aviso de abertura da loja, quando solicitado na lista de espera.</li>
          <li>Cumprir obrigações legais e prevenir fraudes.</li>
        </ul>

        <h2>Compartilhamento</h2>
        <p>
          Compartilhamos dados apenas com prestadores necessários: transportadoras, gateways de
          pagamento, hospedagem e ferramentas de e-mail transacional, sempre com contrato e base
          legal adequados. Não vendemos dados pessoais.
        </p>

        <h2>Seus direitos</h2>
        <p>
          Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade
          ou exclusão, conforme a LGPD, pelo e-mail{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-iseul-ink underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <h2>Retenção e segurança</h2>
        <p>
          Mantemos dados pelo tempo necessário às finalidades e exigências fiscais. Adotamos medidas
          técnicas e organizacionais para proteger informações contra acesso não autorizado.
        </p>

        <h2>Atualizações</h2>
        <p>Esta política pode ser atualizada. A data da versão vigente aparece no rodapé do site.</p>
      </PolicyDoc>
    </PolicyPageShell>
  );
}
