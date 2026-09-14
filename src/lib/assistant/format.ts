export type AssistantBlock =
  | { type: "text"; text: string }
  | { type: "step"; title: string }
  | { type: "product"; slug: string; name: string; price?: string; note?: string };

const PRODUCT_LINE =
  /^::produto(?:\s+slug:)?\s*<?([a-z0-9-]+)>?\s*(?:\|\s*([^|]+?)\s*(?:\|\s*(.+?))?)?\s*$/i;
const STEP_LINE = /^::passo\s+(.+)$/i;
const PRODUCT_MENTION =
  /([^()\n]{6,140}?)\s*(?:por\s+(R\$\s*[\d.]*,\d{2})\s*)?\((?:https?:\/\/(?:www\.)?iseul\.com\.br)?\/produtos\/([a-z0-9-]+)\)/gi;
const MARKDOWN_PRODUCT =
  /\[([^\]]+)\]\((?:https?:\/\/(?:www\.)?iseul\.com\.br)?\/produtos\/([a-z0-9-]+)\)/g;

function pushText(blocks: AssistantBlock[], text: string) {
  const cleaned = text
    .replace(/::produto(?:\s+slug:)?\s*<?[a-z0-9-]+>?/gi, " ")
    .replace(/::passo\s*[^|\n]*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (cleaned) blocks.push({ type: "text", text: cleaned });
}

export function normalizeAssistantMarkup(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\s+(::produto)/gi, "\n$1")
    .replace(/\s+(::passo)/gi, "\n$1")
    .replace(/::produto\s+slug\s*:\s*/gi, "::produto ")
    .replace(/::produto\s+<([a-z0-9-]+)>/gi, "::produto $1")
    .replace(/::passo\s*:\s*/gi, "::passo ");
}

function cleanProductName(raw: string): string {
  return raw
    .replace(/^[\d.)\-\s]+/, "")
    .replace(/^(Limpeza|Tratamento|Tratar|Selar|Proteger|Hidratação|Sérum|Hidratante|Protetor)\s*:\s*/i, "")
    .replace(/^(Comece com o|Comece com a|Use a|Use o|Use as|com o|com a)\s+/i, "")
    .replace(/\s+para\s+.+$/i, "")
    .replace(/^[-–]\s*/, "")
    .trim();
}

function parseStructured(raw: string): AssistantBlock[] | null {
  if (!raw.includes("::produto") && !raw.includes("::passo")) return null;

  const blocks: AssistantBlock[] = [];
  const lines = raw.split(/\n+/);
  let pendingProduct: Extract<AssistantBlock, { type: "product" }> | null = null;

  const flushProduct = () => {
    if (pendingProduct) {
      blocks.push(pendingProduct);
      pendingProduct = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const product = trimmed.match(PRODUCT_LINE);
    if (product) {
      flushProduct();
      pendingProduct = {
        type: "product",
        slug: product[1],
        name: product[2]?.trim() || product[1].replace(/-/g, " "),
        price: product[3]?.trim() || undefined,
      };
      continue;
    }

    const step = trimmed.match(STEP_LINE) ?? trimmed.match(/^(Limpar|Tratar|Selar|Proteger|Limpeza|Tratamento)$/i);
    if (step) {
      flushProduct();
      blocks.push({ type: "step", title: (step[1] ?? trimmed).trim() });
      continue;
    }

    if (pendingProduct && !pendingProduct.note) {
      pendingProduct.note = trimmed.trim();
      continue;
    }

    flushProduct();
    pushText(blocks, trimmed);
  }

  flushProduct();
  return blocks.length ? blocks : null;
}

function parseLooseProducts(raw: string): AssistantBlock[] {
  const prepared = raw
    .replace(MARKDOWN_PRODUCT, "$1 (/produtos/$2)")
    .replace(/\s+(\d+)\.\s+/g, "\n$1. ")
    .replace(/\s+-\s+/g, "\n- ");

  const blocks: AssistantBlock[] = [];
  const chunks = prepared.split(/\n+/);

  for (const chunk of chunks) {
    const stepOnly = chunk.match(/^\d+\.\s*([^:]{2,40}):\s*(.*)$/);
    const body = stepOnly ? stepOnly[2] : chunk;
    if (stepOnly) {
      blocks.push({ type: "step", title: stepOnly[1].trim() });
    }

    let cursor = 0;
    const mentions = [...body.matchAll(PRODUCT_MENTION)];
    if (!mentions.length) {
      pushText(blocks, body);
      continue;
    }

    for (const match of mentions) {
      const start = match.index ?? 0;
      if (start > cursor) pushText(blocks, body.slice(cursor, start));
      blocks.push({
        type: "product",
        slug: match[3],
        name: cleanProductName(match[1]),
        price: match[2]?.trim() || undefined,
      });
      cursor = start + match[0].length;
    }
    if (cursor < body.length) pushText(blocks, body.slice(cursor).replace(/^[\s.)]+/, ""));
  }

  return blocks;
}

export function parseAssistantBlocks(raw: string): AssistantBlock[] {
  const normalized = normalizeAssistantMarkup(raw);
  return parseStructured(normalized) ?? parseLooseProducts(normalized);
}

export function productHref(slug: string) {
  return `/produtos/${slug}`;
}
