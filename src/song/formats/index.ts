export interface FileFormat {
  name: string;
  fileExtensions: string[];
}

export interface Formats<T> {
  list: T[];
  byName: {[key: string]: T};
  byExtension: {[key: string]: T};
}

export const processFormats = <T extends FileFormat>(formats: T[]): Formats<T> => {
  const byName = {};
  const byExtension = {};
  formats.forEach(f => {
    byName[f.name.toLowerCase()] = f;
    f.fileExtensions.forEach(ext => {
      byExtension[ext] = f;
    });
  });
  return {
    list: formats,
    byName: byName,
    byExtension: byExtension
  };
};

const extensionRegExp = /\.[^\/\\\.]+$/;
export const determineFormat = <T>(
  fileName: string,
  formatName: string,
  formats: Formats<T>,
  defaultFormatName: string
): T => {
  let result;
  if (formatName) {
    result = formats.byName[formatName];
    if (!result) {
      throw new Error(`Invalid format: ${formatName}`);
    }
  } else if (fileName) {
    const match = extensionRegExp.exec(fileName);
    if (match) {
      result = formats.byExtension[match[0]];
    }
  }
  return result || formats.byName[defaultFormatName];
};
