export interface PixPayloadInput {
  key: string;
  merchantName: string;
  city: string;
  amountCents?: number;
  txid?: string;
}

function field(id: string, value: string): string {
  return id + value.length.toString().padStart(2, '0') + value;
}

function clean(text: string, max: number): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .slice(0, max);
}

/** CRC16-CCITT-FALSE (polinômio 0x1021, inicial 0xFFFF), exigido pelo BR Code. */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Gera o "Pix copia e cola" estático (BR Code) com valor opcional. */
export function buildPixPayload(input: PixPayloadInput): string {
  const txid = input.txid ? input.txid.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) : '';
  const parts = [
    field('00', '01'),
    field('26', field('00', 'br.gov.bcb.pix') + field('01', input.key.trim())),
    field('52', '0000'),
    field('53', '986'),
    input.amountCents ? field('54', (input.amountCents / 100).toFixed(2)) : '',
    field('58', 'BR'),
    field('59', clean(input.merchantName, 25)),
    field('60', clean(input.city, 15)),
    field('62', field('05', txid || '***')),
  ];
  const withoutCrc = parts.join('') + '6304';
  return withoutCrc + crc16(withoutCrc);
}
