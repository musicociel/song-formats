import {Song} from '../../song';
import {FileFormat, Formats, processFormats, determineFormat} from '../index';
import {musicocielImporter} from './musicociel';
import {openSongImporter} from './opensong';
import {chordproImporter} from './chordpro';

export interface FileImporter extends FileFormat {
  importFile(fileContent): Song;
}

export const autoDetectImporter: FileImporter = {
  name: 'Auto',
  fileExtensions: [],

  importFile(fileContent): Song {
    const errors: {importer: FileImporter, error}[] = [];
    // tslint:disable-next-line:no-use-before-declare
    for (const importer of importers.list) {
      if (importer === autoDetectImporter) {
        continue;
      }
      try {
        const song = importer.importFile(fileContent);
        return song;
      } catch (error) {
        errors.push({importer, error});
      }
    }
    const error = new Error();
    error['causes'] = errors;
    throw error;
  }
};

export const importers = processFormats([
  musicocielImporter,
  openSongImporter,
  chordproImporter,
  autoDetectImporter
]);

export const importFile = (
  fileContent,
  fileName: string,
  formatName?: string,
  defaultFormatName: string = 'auto'
) => {
  const importer = determineFormat(importers, defaultFormatName, fileName, formatName);
  return importer.importFile(fileContent);
};
