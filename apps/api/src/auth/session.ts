/**
 * Sessões (tokens) emitidas antes da última troca de senha deixam de valer.
 * `iat` vem do token, em segundos; a comparação é em segundos para a sessão
 * criada no mesmo instante da troca continuar valendo.
 */
export function sessionStartedBeforePasswordChange(iat: number | undefined, passwordChangedAt: Date | null): boolean {
  if (!passwordChangedAt || iat === undefined) return false;
  return iat < Math.floor(passwordChangedAt.getTime() / 1000);
}
