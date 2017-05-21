import {FileImporter} from './index';
import {parseChord} from '../../chord';
import {Song, SongAuthor, Part, Event, SheetMusic} from '../../song';
import {SongBuilder} from '../builder';

const chordRegExp = /\[([^\[\]]+)\]/;
const directiveRegExp = /^\{([_a-z]+)(?:[:\s](.*))?\}$/i;

export const chordproImporter: FileImporter = {
  // cf the following specifications:
  // http://www.chordpro.org/chordpro/v50.html
  // http://www.pmwiki.org/wiki/Cookbook/ChordPro-Format
  // http://tenbyten.com/software/songsgen/help/HtmlHelp/files_reference.htm

  name: 'ChordPro',
  fileExtensions: ['.cho', '.crd', '.chordpro', '.chopro'],

  importFile(content): Song {
    const builder = new SongBuilder();

    content = content.replace(/\r\n|\n\r|\r/g, '\n');
    const lines = content.split('\n');

    const executeDirective = (line, directivesMap) => {
      const match = directiveRegExp.exec(line);
      if (match) {
        const directiveName = match[1].toLowerCase();
        const directiveHandler = directivesMap.hasOwnProperty(directiveName) ? directivesMap[directiveName] : null;
        if (directiveHandler) {
          let arg = match[2];
          if (arg) {
            arg = arg.trim();
          }
          directiveHandler(arg);
        }
      }
    };
    const metadata = {
      'title': (title) => builder.addTitle(title),
      'subtitle': (authors) => builder.splitAndAddAuthors(authors),
      'copyright': (copyright) => builder.addCopyright(copyright),
      'composer': (composer) => builder.addAuthor(composer, 'composer'),
      'lyricist': (lyricist) => builder.addAuthor(lyricist, 'lyricist'),
      'arranger': (arranger) => builder.addAuthor(arranger, 'arranger')
    };
    // tslint:disable-next-line:no-use-before-declare
    const directiveAlias = (name) => (arg) => directives[name](arg);
    const metadataAlias = (name) => (arg) => metadata[name](arg);
    let insideChorus = false;
    const directives = {
      'title': metadataAlias('title'),
      't': metadataAlias('title'),
      'subtitle': metadataAlias('subtitle'),
      'st': metadataAlias('subtitle'),
      'copyright': metadataAlias('copyright'),
      'composer': metadataAlias('composer'),
      'lyricist': metadataAlias('lyricist'),
      'arranger': metadataAlias('arranger'),
      'comment': (comment) => {
        if (comment.indexOf('\xa9') > -1) {
          // contains a copyright character
          builder.addCopyright(comment);
        } else {
          builder.getCurrentPart().addComments(comment);
          builder.getCurrentPart().changeLine();
        }
      },
      'c': directiveAlias('comment'),
      'start_of_chorus': () => {
        insideChorus = true;
        builder.changePart();
      },
      'soc': directiveAlias('start_of_chorus'),
      'end_of_chorus': () => {
        insideChorus = false;
        builder.changePart();
      },
      'eoc': directiveAlias('end_of_chorus'),
      'meta': (arg) => {
        executeDirective(`{${arg}}`, metadata);
      }
    };
    for (let curLine of lines) {
      curLine = curLine.trim();
      const firstChar = curLine.charAt(0);
      if (firstChar === '{' && curLine.charAt(curLine.length - 1) === '}') {
        // directive
        executeDirective(curLine, directives);
      } else if (firstChar === '#') {
        // this is a comment, to be ignored
      } else if (!firstChar) {
        // empty line
        builder.changePart();
      } else {
        // text/chords
        // each part (except perhaps the first one) starts with a chord:
        let match = chordRegExp.exec(curLine);
        while (match) {
          if (match.index > 0) {
            builder.getCurrentPart().addLyrics(curLine.substr(0, match.index));
          }
          builder.getCurrentPart().changeEvent();
          builder.getCurrentPart().addChord(match[1]);
          curLine = curLine.substr(match.index + match[0].length);
          match = chordRegExp.exec(curLine);
        }
        if (curLine) {
          builder.getCurrentPart().addLyrics(curLine);
        }
        builder.getCurrentPart().changeLine();
        if (insideChorus) {
          builder.getCurrentPart().setType('chorus');
        }
      }
    }
    return builder.buildSong();
  }
};
