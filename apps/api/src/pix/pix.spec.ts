import { buildPixPayload, crc16 } from './pix';

describe('crc16', () => {
  it('calcula CRC16-CCITT-FALSE', () => {
    expect(crc16('123456789')).toBe('29B1');
  });
});

describe('buildPixPayload', () => {
  it('gera o exemplo oficial do manual do Banco Central', () => {
    const payload = buildPixPayload({
      key: '123e4567-e12b-12d1-a456-426655440000',
      merchantName: 'Fulano de Tal',
      city: 'BRASILIA',
    });
    expect(payload).toBe(
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D',
    );
  });

  it('inclui valor e txid e remove acentos', () => {
    const payload = buildPixPayload({
      key: 'loja@email.com',
      merchantName: 'Manu Suplementos Ltda São',
      city: 'São Paulo',
      amountCents: 12345,
      txid: 'MS-4F7K2',
    });
    expect(payload).toContain('5406123.45');
    expect(payload).toContain('5925Manu Suplementos Ltda Sao');
    expect(payload).toContain('6009Sao Paulo');
    expect(payload).toContain('62110507MS4F7K2');
    expect(payload.slice(-8, -4)).toBe('6304');
    expect(crc16(payload.slice(0, -4))).toBe(payload.slice(-4));
  });
});
