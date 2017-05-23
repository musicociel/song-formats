import * as stringify from 'json-stable-stringify';
import * as diacritics from 'diacritics';
import * as createHash from 'sha.js';
import { Song, extractLyrics } from './song';

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
  const id = `song\u0000${diacritics.remove(song.title).toLowerCase()}\u0000${hash}`;
  const lyrics = extractLyrics(song.music);
  return {
    _id: id,
    type: 'song',
    lyrics,
    object: song
  };
}
