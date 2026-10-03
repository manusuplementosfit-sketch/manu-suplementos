import { changeProblem } from './change';

describe('troco do pagamento em dinheiro', () => {
  it('troco é opcional', () => {
    expect(changeProblem('DINHEIRO', undefined, 5000)).toBeNull();
    expect(changeProblem('DINHEIRO', null, 5000)).toBeNull();
  });

  it('aceita troco para um valor maior que o total', () => {
    expect(changeProblem('DINHEIRO', 10000, 4990)).toBeNull();
  });

  it('recusa troco menor ou igual ao total', () => {
    expect(changeProblem('DINHEIRO', 4990, 4990)).toMatch(/maior que o total/);
    expect(changeProblem('DINHEIRO', 2000, 4990)).toMatch(/maior que o total/);
  });

  it('troco só existe no pagamento em dinheiro', () => {
    expect(changeProblem('PIX', 10000, 4990)).toMatch(/só vale para pagamento em dinheiro/);
    expect(changeProblem('CARTAO', 10000, 4990)).toMatch(/só vale para pagamento em dinheiro/);
    expect(changeProblem('PIX', undefined, 4990)).toBeNull();
  });
});
