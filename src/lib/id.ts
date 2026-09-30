// id generation. Assumes secure context / localhost where crypto.randomUUID exists.

export function newId(): string {
  return crypto.randomUUID()
}
