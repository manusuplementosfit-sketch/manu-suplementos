import { BadRequestException, Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export type UploadFolder = 'products' | 'receipts';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

// A Vercel limita o corpo da requisição a 4,5 MB
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

@Injectable()
export class StorageService {
  /** Valida e salva o arquivo; devolve a URL pública. */
  async save(file: Express.Multer.File | undefined, folder: UploadFolder, allowPdf = false): Promise<string> {
    if (!file) throw new BadRequestException('Envie um arquivo');
    const ext = EXTENSIONS[file.mimetype];
    if (!ext || (ext === '.pdf' && !allowPdf)) {
      throw new BadRequestException(allowPdf ? 'Envie uma imagem ou PDF' : 'Envie uma imagem JPG, PNG ou WEBP');
    }
    if (file.size > MAX_UPLOAD_BYTES) throw new BadRequestException('Arquivo maior que 4 MB');

    const name = `${folder}/${randomUUID()}${ext}`;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(name, file.buffer, { access: 'public', contentType: file.mimetype });
      return blob.url;
    }

    await mkdir(join(process.cwd(), 'uploads', folder), { recursive: true });
    await writeFile(join(process.cwd(), 'uploads', name), file.buffer);
    return `${process.env.API_URL ?? 'http://localhost:3001'}/uploads/${name}`;
  }
}
