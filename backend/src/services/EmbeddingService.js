const DEFAULT_MODEL_ID = "Xenova/all-MiniLM-L6-v2";

const MODEL_ID = process.env.AI_EMBEDDING_MODEL || DEFAULT_MODEL_ID;
const MAX_TEXT_LENGTH = Number(process.env.AI_EMBEDDING_MAX_CHARS || 2000);

let embedderPromise = null;

const getEmbedder = async () => {
    if (!embedderPromise) {
        embedderPromise = import("@xenova/transformers").then(({ pipeline }) =>
            pipeline("feature-extraction", MODEL_ID)
        );
    }

    return embedderPromise;
};

const normalizeText = (text) => {
    if (!text) return "";
    const normalized = String(text).replace(/\s+/g, " ").trim();
    if (normalized.length <= MAX_TEXT_LENGTH) {
        return normalized;
    }
    return normalized.slice(0, MAX_TEXT_LENGTH);
};

const embedText = async (text) => {
    const content = normalizeText(text);
    if (!content) return [];

    const embedder = await getEmbedder();
    const output = await embedder(content, { pooling: "mean", normalize: true });
    return Array.from(output.data || []);
};

module.exports = {
    embedText,
    normalizeText,
};
