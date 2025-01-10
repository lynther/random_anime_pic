import { Command } from 'commander';
import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import pLimit from 'p-limit';
import type { CommandOptionsValues, NekosapiResponse, Rating } from './types';
import { calculateLimits, myParseInt } from './utils';

async function getImages(total: number, rating: Rating): Promise<string[]> {
  const worker = async (limit: number, rating: Rating): Promise<string[]> => {
    const url = `https://api.nekosapi.com/v4/images/random?limit=${limit}&rating=${rating}`;

    try {
      const response = await fetch(url);
      const images = (await response.json()) as NekosapiResponse[];

      return images.map(image => image.url);
    } catch (error) {
      console.error(`worker(${url}) - ${error}`);
      return [];
    }
  };

  const getImagesLimit = pLimit(10);
  const limits = calculateLimits(total);

  const images = await Promise.all(
    limits.map(limit => getImagesLimit(() => worker(limit, rating)))
  );
  return images.flat();
}

async function downloadImage(
  url: string,
  downloadDir: string
): Promise<string> {
  let arrayBuffer: ArrayBuffer;
  const filePath = path.join(downloadDir, path.basename(url));

  if (fs.existsSync(filePath)) {
    return '';
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`saveImage(${url}) - ${response.status}`);
      return '';
    }

    arrayBuffer = await response.arrayBuffer();
  } catch (error) {
    console.error(`saveImage(${url}) - ${error}`);
    return '';
  }

  await writeFile(filePath, new Uint8Array(arrayBuffer));
  console.log(filePath);

  return url;
}

async function downloadImages(
  imageUrls: string[],
  downloadDir: string,
  concurrency: number
): Promise<string[]> {
  const downloadLimit = pLimit(concurrency);
  const downloadedImages = await Promise.all(
    imageUrls.map(url => downloadLimit(() => downloadImage(url, downloadDir)))
  );

  return downloadedImages.filter(url => url !== '');
}

async function main() {
  const program = new Command();
  program.option(
    '-t, --total <number>',
    'Количество изображений для загрузки',
    myParseInt
  );
  program.option(
    '-c, --concurrency <number>',
    'Сколько одновременно загружать изображений (default: 1000)',
    myParseInt
  );
  program.option(
    '-d, --download-dir <string>',
    'Директория для загрузки',
    'downloads'
  );
  program.parse();

  const options = program.opts<CommandOptionsValues>();

  if (!fs.existsSync(options.downloadDir)) {
    fs.mkdirSync(options.downloadDir);
  }

  const totalImages = options.total > 0 ? options.total : 100;
  const concurrency = options.concurrency > 0 ? options.concurrency : 1000;

  const imageUrls = await getImages(totalImages, 'explicit');

  if (!imageUrls.length) {
    console.log('Нет изображений для загрузки.');
    return;
  }

  console.log(`Собрал - ${imageUrls.length} ссылок на изображения`);
  const downloadedUrls = await downloadImages(
    imageUrls,
    options.downloadDir,
    concurrency
  );
  console.log(`Скачал - ${downloadedUrls.length} изображений`);
}

main();
