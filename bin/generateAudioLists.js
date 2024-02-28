import { readdir, writeFile } from 'fs/promises';
import { join } from 'path';

const processDirectory = async (
  directoryPath,
  fileExtensions,
  outputFilePath,
) => {
  try {
    const files = await readdir(String(directoryPath));
    console.log(`Files in the directory ${directoryPath}:`, files);
    const filteredFiles = files.filter((file) =>
      new RegExp(`\\.(${fileExtensions.join('|')})$`).test(file),
    );
    await writeFile(String(outputFilePath), JSON.stringify(filteredFiles));
    console.log(`List was successfully generated at ${outputFilePath}`);
  } catch (err) {
    console.error('There was an error:', err);
  }
};

const basePath = process.cwd();
const audioDirectory = join(basePath, 'public/sounds');
const midiDirectory = join(basePath, 'public/midi');
const audioOutputFile = join(basePath, 'src/assets/soundList.json');
const midiOutputFile = join(basePath, 'src/assets/midiList.json');
const audioExtensions = ['mp3', 'wav', 'aac', 'm4a'];
const midiExtensions = ['mid'];

processDirectory(audioDirectory, audioExtensions, audioOutputFile).catch(
  (err) => {
    console.error(err);
  },
);
processDirectory(midiDirectory, midiExtensions, midiOutputFile).catch((err) => {
  console.error(err);
});
