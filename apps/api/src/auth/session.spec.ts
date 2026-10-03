import { sessionStartedBeforePasswordChange } from './session';

describe('sessões antigas depois de trocar a senha', () => {
  const changedAt = new Date('2026-10-03T15:00:00.500Z');

  it('derruba sessões iniciadas antes da troca', () => {
    const iat = Math.floor(new Date('2026-10-03T14:00:00Z').getTime() / 1000);
    expect(sessionStartedBeforePasswordChange(iat, changedAt)).toBe(true);
  });

  it('mantém a sessão criada na hora da troca ou depois', () => {
    expect(sessionStartedBeforePasswordChange(Math.floor(changedAt.getTime() / 1000), changedAt)).toBe(false);
  });

  it('sem troca de senha registrada, nada muda', () => {
    expect(sessionStartedBeforePasswordChange(1, null)).toBe(false);
  });
});
