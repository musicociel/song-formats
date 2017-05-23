import {Song} from '../../song';
import {FileFormat, Formats, processFormats, determineFormat} from '../index';
import {musicocielExporter} from './musicociel';

export interface FileExporter extends FileFormat {
  exportFile(song: Song): string;
}

export const exporters = processFormats([musicocielExporter]);

export const exportFile = (
  song: Song,
  fileName?: string,
  formatName?: string,
  defaultFormatName: string = 'musicociel'
) => {
  const exporter = determineFormat(exporters, defaultFormatName, fileName, formatName);
  return exporter.exportFile(song);
};
