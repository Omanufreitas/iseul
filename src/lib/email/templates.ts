import { CONTACT_EMAIL, LEGAL_LINE, SITE_URL } from "@/lib/site";
import { escapeHtml } from "@/lib/email/format";

export type OrderEmailItem = {
  name: string;
  brand?: string | null;
  variant?: string | null;
  quantity: number;
  price: string;
  image?: string | null;
};

export type OrderEmailAddress = {
  linha1: string;
  linha2: string;
  cep: string;
};

export type ConfirmedOrderEmail = {
  numero: string;
  primeiroNome: string;
  itens: OrderEmailItem[];
  subtotal: string;
  desconto?: { valor: string; cupom?: string | null } | null;
  frete: { transportadora: string; valor: string };
  total: string;
  pagamento: { metodo: string; parcelas?: string | null };
  nfe?: string | null;
  data: string;
  endereco: OrderEmailAddress;
};

export type ShippedOrderEmail = {
  numero: string;
  primeiroNome: string;
  frete: { transportadora: string };
  rastreio: { codigo: string; url: string; instrucao?: string | null };
  endereco: OrderEmailAddress;
  itens: Array<{ quantidade: number; nome: string; variante?: string | null }>;
};

const LOGO_URL = `${SITE_URL}/email/iseul-logo@2x.png`;

function preheaderPad(): string {
  return "&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;";
}

function brandBlock(): string {
  return `
  <tr><td style="padding:0 0 26px">
    <a href="${SITE_URL}" style="text-decoration:none">
      <img src="${LOGO_URL}" width="34" height="34" alt="Iseul"
           style="display:block;border:0;outline:none">
    </a>
  </td></tr>`;
}

function signatureBlock(numero: string): string {
  return `
  <tr><td style="padding:0 0 6px;font-family:Georgia,'Times New Roman',serif;
                 font-size:16px;color:#1C1A16">Brendon Lanen</td></tr>
  <tr><td style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;
                 color:#3F5C4E;padding:0 0 18px">Importação e curadoria · Iseul</td></tr>

  <tr><td style="font-size:12px;line-height:1.6;color:#5D7869">
    <a href="mailto:${CONTACT_EMAIL}" style="color:#5D7869;text-decoration:none">${CONTACT_EMAIL}</a>
    &nbsp;·&nbsp;
    <a href="${SITE_URL}" style="color:#5D7869;text-decoration:none">iseul.com.br</a>
    &nbsp;·&nbsp;
    <a href="https://instagram.com/iseul.br" style="color:#5D7869;text-decoration:none">@iseul.br</a>
  </td></tr>

  <tr><td style="font-size:11px;line-height:1.6;color:#9A948A;padding:22px 0 0">
    Você recebeu este e-mail porque fez o pedido #${escapeHtml(numero)} em iseul.com.br.<br>
    ${escapeHtml(LEGAL_LINE.replace(" · contato@iseul.com.br", ""))}
  </td></tr>`;
}

function itemRow(item: OrderEmailItem): string {
  const image = item.image
    ? `<td width="64" valign="top" style="padding:0 14px 14px 0">
              <img src="${escapeHtml(item.image)}" width="56" height="56" alt=""
                   style="display:block;border:0;border-radius:6px;background:#FFFFFF;
                          width:56px;height:56px;object-fit:cover">
            </td>`
    : "";
  const brand = item.brand
    ? `<span style="display:block;font-size:11px;letter-spacing:.12em;
                text-transform:uppercase;color:#8B857A;padding:0 0 2px">${escapeHtml(item.brand)}</span>`
    : "";
  const variant = item.variant ? `${escapeHtml(item.variant)} · ` : "";

  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%"
               style="border-collapse:collapse">
          <tr>
            ${image}
            <td valign="top" style="font-size:15px;line-height:1.45;color:#1C1A16;padding:0 12px 14px 0">
              ${brand}
              ${escapeHtml(item.name)}
              <span style="display:block;font-size:13px;color:#6E6A62;padding:3px 0 0">
                ${variant}Quantidade: ${item.quantity}
              </span>
            </td>
            <td align="right" valign="top"
                style="font-size:15px;line-height:1.45;color:#1C1A16;white-space:nowrap;
                       padding:0 0 14px">
              ${escapeHtml(item.price)}
            </td>
          </tr>
        </table>`;
}

export function renderPedidoConfirmadoHtml(data: ConfirmedOrderEmail): string {
  const n = escapeHtml(data.numero);
  const nome = escapeHtml(data.primeiroNome);
  const desconto = data.desconto
    ? `<tr>
            <td style="font-size:14px;line-height:1.5;color:#6E6A62;padding:8px 12px 0 0">
              Desconto${data.desconto.cupom ? ` · cupom ${escapeHtml(data.desconto.cupom)}` : ""}</td>
            <td align="right" style="font-size:14px;line-height:1.5;color:#6E6A62;
                       white-space:nowrap;padding:8px 0 0">
              − ${escapeHtml(data.desconto.valor)}
            </td>
          </tr>`
    : "";
  const nfe = data.nfe ? ` NF-e ${escapeHtml(data.nfe)} &nbsp;·&nbsp;` : "";
  const parcelas = data.pagamento.parcelas ? ` em ${escapeHtml(data.pagamento.parcelas)}` : "";
  const enderecoLinha2 = [data.endereco.linha2, data.endereco.cep ? `CEP ${data.endereco.cep}` : ""]
    .filter(Boolean)
    .join(" · ");

  return `<!doctype html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>Pedido #${n} confirmado · Iseul</title>
<style>
  body{margin:0;padding:0;background:#FAF8F4}
  a{color:#3F5C4E}
  @media (max-width:620px){
    .pad{padding-left:20px !important;padding-right:20px !important}
    .h1{font-size:27px !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#FAF8F4">

<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#FAF8F4;font-size:1px;line-height:1px">
  Pagamento aprovado. Seu pedido #${n} já está em separação.${preheaderPad()}
</div>

<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%"
       style="border-collapse:collapse;background:#FAF8F4">
<tr><td align="center" style="padding:28px 12px">

<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="600" class="pad"
       style="border-collapse:collapse;max-width:600px;width:100%;
              font-family:Helvetica,Arial,sans-serif">

  ${brandBlock()}

  <tr><td style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;
                 font-weight:700;color:#5D7869;padding:0 0 12px">
    Pedido #${n} · pagamento aprovado
  </td></tr>

  <tr><td class="h1" style="font-family:Georgia,'Times New Roman',serif;font-size:32px;
                 line-height:1.2;color:#1C1A16;padding:0 0 16px">
    Recebi seu pedido, ${nome}.
  </td></tr>

  <tr><td style="font-size:15px;line-height:1.62;color:#6E6A62;padding:0 0 26px">
    Seu pagamento foi aprovado e o pedido já está na fila de separação. A partir daqui é
    comigo: eu confiro cada item, embalo com cuidado e despacho.
  </td></tr>

  <tr><td style="padding:0 0 26px">
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%"
           style="border-collapse:collapse;border:1px solid #E4DED4;border-radius:8px;
                  background:#F4F1EA">
      <tr><td style="padding:24px 26px 22px">

        <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;
                    font-weight:700;color:#5D7869;padding:0 0 14px">
          O que você comprou
        </div>

        ${data.itens.map(itemRow).join("\n        ")}

        <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%"
               style="border-collapse:collapse">
          <tr>
            <td style="border-top:1px solid #E4DED4;font-size:14px;line-height:1.5;
                       color:#6E6A62;padding:12px 12px 0 0">Subtotal</td>
            <td align="right" style="border-top:1px solid #E4DED4;font-size:14px;
                       line-height:1.5;color:#6E6A62;white-space:nowrap;padding:12px 0 0">
              ${escapeHtml(data.subtotal)}
            </td>
          </tr>
          ${desconto}
          <tr>
            <td style="font-size:14px;line-height:1.5;color:#6E6A62;padding:8px 12px 0 0">
              Frete · ${escapeHtml(data.frete.transportadora)}</td>
            <td align="right" style="font-size:14px;line-height:1.5;color:#3F5C4E;
                       font-weight:700;white-space:nowrap;padding:8px 0 0">
              ${escapeHtml(data.frete.valor)}
            </td>
          </tr>
          <tr>
            <td style="font-size:16px;line-height:1.5;color:#1C1A16;font-weight:700;
                       padding:10px 12px 0 0">Total pago</td>
            <td align="right" style="font-size:16px;line-height:1.5;color:#1C1A16;
                       font-weight:700;white-space:nowrap;padding:10px 0 0">
              ${escapeHtml(data.total)}
            </td>
          </tr>
        </table>

        <div style="font-size:13px;line-height:1.6;color:#8B857A;padding:14px 0 0">
          ${escapeHtml(data.pagamento.metodo)} aprovado${parcelas}
          &nbsp;·&nbsp;${nfe} ${escapeHtml(data.data)}
        </div>

      </td></tr>
    </table>
  </td></tr>

  <tr><td style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;
                 font-weight:700;color:#5D7869;padding:0 0 12px">
    Endereço de entrega
  </td></tr>
  <tr><td style="font-size:15px;line-height:1.62;color:#6E6A62;padding:0 0 22px">
    ${escapeHtml(data.endereco.linha1)}<br>
    ${escapeHtml(enderecoLinha2)}
  </td></tr>

  <tr><td style="padding:0 0 22px">
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%"
           style="border-collapse:collapse;border:1px solid #BFD3C1;border-radius:8px;
                  background:#EDF3EC">
      <tr><td style="padding:20px 24px 18px">
        <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;
                    font-weight:700;color:#3F5C4E;padding:0 0 8px">
          Próximo passo
        </div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;
                    line-height:1.3;color:#1C1A16;padding:0 0 8px">
          O rastreio chega neste mesmo e-mail.
        </div>
        <div style="font-size:14px;line-height:1.65;color:#5A6B5C">
          Assim que o seu pedido for postado, você recebe aqui o código para acompanhar a
          entrega pela ${escapeHtml(data.frete.transportadora)}.
        </div>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="font-size:14px;line-height:1.65;color:#6E6A62;padding:0 0 12px">
    <strong style="color:#1C1A16;font-weight:700">Toda a comunicação do seu pedido é
    feita por e-mail</strong> — confirmação, rastreio e qualquer aviso. Se não aparecer
    nada nos próximos dias, dá uma olhada na lixeira e no spam.
  </td></tr>

  <tr><td style="font-size:14px;line-height:1.65;color:#6E6A62;padding:0 0 30px">
    E quando chegar, me conta o que você quer melhorar na pele que eu te ajudo a montar a
    rotina — qual produto usar primeiro, em que ordem e com que frequência. É só responder
    este e-mail. Quem responde sou eu.
  </td></tr>

  ${signatureBlock(data.numero)}

</table>
</td></tr>
</table>
</body>
</html>`;
}

export function renderPedidoEnviadoHtml(data: ShippedOrderEmail): string {
  const n = escapeHtml(data.numero);
  const nome = escapeHtml(data.primeiroNome);
  const codigo = escapeHtml(data.rastreio.codigo);
  const instrucao = data.rastreio.instrucao
    ? `<div style="font-size:13px;line-height:1.6;color:#5A6B5C;padding:14px 0 0">
          ${escapeHtml(data.rastreio.instrucao)}
        </div>`
    : "";
  const itens = data.itens
    .map((item) => {
      const variante = item.variante ? ` — ${escapeHtml(item.variante)}` : "";
      return `${item.quantidade}× ${escapeHtml(item.nome)}${variante}<br>`;
    })
    .join("\n            ");
  const cep = data.endereco.cep ? `CEP ${escapeHtml(data.endereco.cep)}` : "";

  return `<!doctype html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>Seu pedido #${n} saiu · Iseul</title>
<style>
  body{margin:0;padding:0;background:#FAF8F4}
  a{color:#3F5C4E}
  @media (max-width:620px){
    .pad{padding-left:20px !important;padding-right:20px !important}
    .h1{font-size:27px !important}
    .codigo{font-size:19px !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#FAF8F4">

<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#FAF8F4;font-size:1px;line-height:1px">
  Seu pedido #${n} foi postado pela ${escapeHtml(data.frete.transportadora)}. Aqui está o rastreio.${preheaderPad()}
</div>

<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%"
       style="border-collapse:collapse;background:#FAF8F4">
<tr><td align="center" style="padding:28px 12px">

<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="600" class="pad"
       style="border-collapse:collapse;max-width:600px;width:100%;
              font-family:Helvetica,Arial,sans-serif">

  ${brandBlock()}

  <tr><td style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;
                 font-weight:700;color:#5D7869;padding:0 0 12px">
    Pedido #${n} · enviado
  </td></tr>

  <tr><td class="h1" style="font-family:Georgia,'Times New Roman',serif;font-size:32px;
                 line-height:1.2;color:#1C1A16;padding:0 0 16px">
    Seu pedido saiu, ${nome}.
  </td></tr>

  <tr><td style="font-size:15px;line-height:1.62;color:#6E6A62;padding:0 0 26px">
    Acabei de postar o seu pedido. Abaixo está o código para acompanhar a entrega até a
    sua porta.
  </td></tr>

  <tr><td style="padding:0 0 22px">
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%"
           style="border-collapse:collapse;border:1px solid #BFD3C1;border-radius:8px;
                  background:#EDF3EC">
      <tr><td style="padding:24px 26px 22px">
        <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;
                    font-weight:700;color:#3F5C4E;padding:0 0 10px">
          Código de rastreio · ${escapeHtml(data.frete.transportadora)}
        </div>
        <div class="codigo" style="font-family:'Courier New',Courier,monospace;font-size:22px;
                    line-height:1.3;letter-spacing:.04em;color:#1C1A16;font-weight:700;
                    padding:0 0 16px;word-break:break-all">
          ${codigo}
        </div>
        <a href="${escapeHtml(data.rastreio.url)}" style="display:inline-block;background:#3F5C4E;color:#FAF8F4;
           font-size:14px;line-height:1;text-decoration:none;font-weight:700;
           padding:14px 24px;border-radius:6px">
          Acompanhar a entrega
        </a>
        ${instrucao}
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="font-size:14px;line-height:1.65;color:#6E6A62;padding:0 0 12px">
    <strong style="color:#1C1A16;font-weight:700">O código pode levar até 24 horas úteis
    para mostrar a primeira movimentação.</strong> Se abrir agora e ainda não aparecer
    nada, é normal — é o tempo da transportadora registrar a postagem.
  </td></tr>

  <tr><td style="font-size:14px;line-height:1.65;color:#6E6A62;padding:0 0 26px">
    <strong style="color:#1C1A16;font-weight:700">Por segurança:</strong> a transportadora
    não cobra nenhum valor extra por WhatsApp ou SMS. O link oficial do seu pedido é o
    deste e-mail.
  </td></tr>

  <tr><td style="padding:0 0 26px">
    <div style="height:1px;background:#E4DED4;font-size:0;line-height:0">&nbsp;</div>
  </td></tr>

  <tr><td style="padding:0 0 26px">
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%"
           style="border-collapse:collapse">
      <tr>
        <td valign="top" width="50%" style="padding:0 16px 0 0">
          <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;
                      font-weight:700;color:#5D7869;padding:0 0 10px">
            Entrega em
          </div>
          <div style="font-size:14px;line-height:1.62;color:#6E6A62">
            ${escapeHtml(data.endereco.linha1)}<br>
            ${escapeHtml(data.endereco.linha2)}<br>
            ${cep}
          </div>
        </td>
        <td valign="top" width="50%" style="padding:0">
          <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;
                      font-weight:700;color:#5D7869;padding:0 0 10px">
            No pacote
          </div>
          <div style="font-size:14px;line-height:1.62;color:#6E6A62">
            ${itens}
          </div>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="font-size:14px;line-height:1.65;color:#6E6A62;padding:0 0 30px">
    Quando chegar, me conta o que achou. E se quiser ajuda para montar a rotina com os seus
    produtos — o que usar primeiro, de manhã ou à noite — é só responder este e-mail.
    Quem responde sou eu.
  </td></tr>

  ${signatureBlock(data.numero)}

</table>
</td></tr>
</table>
</body>
</html>`;
}
