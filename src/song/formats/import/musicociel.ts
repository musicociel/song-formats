import {FileImporter} from './index';
import {Song} from '../../song';

export const musicocielImporter: FileImporter = {
  name: 'Musicociel',
  fileExtensions: ['.musicociel', '.json'],

  importFile(fileContent): Song {
    // TODO: check file structure
    return JSON.parse(fileContent);
  }
};
