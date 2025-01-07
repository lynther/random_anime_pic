import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { NekosapiResponse, Rating } from './types';
import { calculateLimits } from './utils';

async function getImageUrls(limit: number, rating: Rating): Promise<string[]> {
  let data: NekosapiResponse[];

  try {
    const response = await fetch(
      `https://api.nekosapi.com/v4/images/random?limit=${limit}&rating=${rating}`
    );

    if (!response.ok) {
      console.error(`getImageUrls(${limit}) - ${response.status}`);
      return [];
    }

    data = await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }

  return data.map(r => r.url);
}

if (!fs.existsSync('images')) {
  fs.mkdirSync('images');
}

async function saveImage(url: string): Promise<string | undefined> {
  let arrayBuffer: ArrayBuffer;
  const filePath = path.join('images', path.basename(url));

  if (fs.existsSync(filePath)) {
    return;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`saveImage(${url}) - ${response.status}`);
      return;
    }

    arrayBuffer = await response.arrayBuffer();
  } catch (error) {
    console.error(`saveImage(${url}) - ${error}`);
    return;
  }

  await writeFile(filePath, new Uint8Array(arrayBuffer));
  return url;
}

const totalImages = 2345;
const tasks: Promise<string[]>[] = [];

calculateLimits(totalImages, 100).forEach(limit => {
  tasks.push(getImageUrls(limit, 'explicit'));
});

const imageUrls = (await Promise.all(tasks)).flat();
console.log(`Собрал - ${imageUrls.length} ссылок на изображения`);

const downloadedUrls = (
  await Promise.all(imageUrls.map(url => saveImage(url)))
).filter(url => url !== undefined);

console.log(`Скачал - ${downloadedUrls.length} изображений`);
