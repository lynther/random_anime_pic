import { Command } from 'commander';
import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import pLimit from 'p-limit';
import { calculateLimits, myParseInt, parseRating } from './utils';

const limiter = pLimit(1);

async function getImages(total: number, rating: Rating, concurrency: number): Promise<string[]> {
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

  limiter.concurrency = concurrency;
  const limits = calculateLimits(total);

  const images = await Promise.all(limits.map(limit => limiter(() => worker(limit, rating))));
  return images.flat();
}

async function downloadImage(url: string, downloadDir: string): Promise<string | null> {
  let arrayBuffer: ArrayBuffer;
  const filePath = path.join(downloadDir, path.basename(url));

  if (fs.existsSync(filePath)) {
    return null;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`saveImage(${url}) - ${response.status}`);
      return null;
    }

    arrayBuffer = await response.arrayBuffer();
  } catch (error) {
    console.error(`saveImage(${url}) - ${error}`);
    return null;
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
  limiter.concurrency = concurrency;

  const downloadedImages = await Promise.all(
    imageUrls.map(url => limiter(() => downloadImage(url, downloadDir)))
  );

  return downloadedImages.filter(url => url !== null);
}

async function main() {
  const program = new Command();
  program.option(
    '-t, --total <number>',
    'Количество изображений для загрузки (default: 100)',
    myParseInt,
    100
  );
  program.option(
    '-r, --rating <safe | suggestive | borderline | explicit>',
    'Рейтинг изображений',
    parseRating,
    'safe'
  );
  program.option(
    '-c, --concurrency <number>',
    'Сколько одновременно загружать изображений (default: 1000)',
    myParseInt,
    1000
  );
  program.option('-d, --download-dir <string>', 'Директория для загрузки', 'downloads');
  program.parse();

  const options = program.opts<CommandOptionsValues>();

  if (!fs.existsSync(options.downloadDir)) {
    fs.mkdirSync(options.downloadDir);
  }

  const imageUrls = await getImages(options.total, options.rating, 10);

  if (!imageUrls.length) {
    console.log('Нет изображений для загрузки.');
    return;
  }

  console.log(`Собрал - ${imageUrls.length} ссылок на изображения`);
  const downloadedUrls = await downloadImages(imageUrls, options.downloadDir, options.concurrency);
  console.log(`Скачал - ${downloadedUrls.length} изображений`);
}

main();
