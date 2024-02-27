import { readdir, writeFile } from 'fs/promises';
import { join } from 'path';

const audioDirectory = join(process.cwd(), 'public/sounds');
const outputFile = join(process.cwd(), 'src/assets/audioList.json');

try {
  const files = await readdir(audioDirectory);
  console.log('Files in the audio directory:', files);
  const audioFiles = files.filter((file) => /\.(mp3|wav|aac|m4a)$/.test(file));
  // Write the filenames to a JSON file
  await writeFile(outputFile, JSON.stringify(audioFiles));
  console.log(`Audio list was successfully generated at ${outputFile}`);
} catch (err) {
  console.error('There was an error:', err);
}
