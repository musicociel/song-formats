import * as stringify from 'json-stable-stringify';
import {FileExporter} from './index';
import {Song} from '../../song';

export const musicocielExporter: FileExporter = {
  name: 'Musicociel',
  fileExtensions: ['.musicociel', '.json'],

  exportFile(song: Song) {
    return stringify(song);
  }
};
