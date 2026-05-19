export const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const cn = (...values) => values.filter(Boolean).join(" ");

export function audit(author, body) {
  return {
    id: uid("c"),
    author: author.name,
    authorId: author.id,
    role: author.role,
    timestamp: new Date().toISOString(),
    body,
  };
}
