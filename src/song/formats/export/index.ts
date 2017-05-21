import {Song} from '../../song';
import {FileFormat, Formats, processFormats} from '../index';
import {musicocielExporter} from './musicociel';

export interface FileExporter extends FileFormat {
  exportFile(song: Song): string;
}

export const exporters = processFormats([musicocielExporter]);
