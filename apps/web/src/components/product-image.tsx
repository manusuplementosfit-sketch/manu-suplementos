/**
 * Foto de produto que ocupa a caixa inteira sem cortar nem distorcer a imagem:
 * a foto aparece completa no centro e as sobras são preenchidas por uma versão
 * desfocada dela mesma. Assim toda foto fica do mesmo tamanho, seja ela quadrada,
 * em pé ou deitada. O elemento pai define o tamanho.
 */
export function ProductImage({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="relative h-full w-full object-contain" />
    </div>
  );
}
