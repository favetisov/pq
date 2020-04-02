import { writeFile } from 'fs';
import { promisify } from 'util';

export const writeBase64ToFile = async (base64: string, filepath) => {
  const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches.length != 3) throw new Error('Invalid input string');

  return promisify(writeFile)(filepath, matches[2], 'base64');
};
