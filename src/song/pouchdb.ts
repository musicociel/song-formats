import * as stringify from 'json-stable-stringify';
import * as diacritics from 'diacritics';
import * as createHash from 'sha.js';
import { Song, extractLyrics } from './song';

const specialChars = /[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007F]+/g;
const beginOrEndWithDash = /^-|-$/g;
export function normalizeId(id: string) {
  // this function makes sure the id does not contain special characters that could make CouchDB behave in strange ways
  return id.replace(specialChars, '-').replace(beginOrEndWithDash, '');
}

export interface SongPouchDBEntry {
  _id: string;
  _rev?: string;
  type: 'song';
  lyrics: string;
  object: Song;
}

export function songToPouchDBEntry(song: Song): SongPouchDBEntry {
  const stringifiedSong = stringify(song);
  const hash = createHash('sha256').update(stringifiedSong, 'utf8').digest('hex');
  const id = `song\u0001${normalizeId(diacritics.remove(song.title).toLowerCase())}\u0001${hash}`;
  const lyrics = extractLyrics(song.music);
  return {
    _id: id,
    type: 'song',
    lyrics,
    object: song
  };
}
