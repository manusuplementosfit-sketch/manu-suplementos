import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SettingsDto } from './settings.module';

const base = { pixKey: '', pixMerchantName: 'MANU SUPLEMENTOS', pixCity: 'JAGUARIBE', deliveryFeeCents: 0 };

async function errorsFor(extra: Record<string, unknown>) {
  const errors = await validate(plainToInstance(SettingsDto, { ...base, ...extra }));
  return errors.map((e) => e.property);
}

describe('SettingsDto: cores da marca', () => {
  it('aceita cores no formato #rrggbb (maiúsculas ou minúsculas)', async () => {
    expect(await errorsFor({ brandColor: '#96c82d', inkColor: '#02314B' })).toEqual([]);
  });

  it('cores são opcionais (a versão publicada do site ainda não as envia)', async () => {
    expect(await errorsFor({})).toEqual([]);
  });

  it.each(['#fff', 'red', '96c82d', '#12345g', '#96c82d00', ''])('recusa "%s"', async (color) => {
    expect(await errorsFor({ brandColor: color, inkColor: color })).toEqual(['brandColor', 'inkColor']);
  });
});
