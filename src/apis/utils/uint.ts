import * as uuid from 'uuid';
import Exception from '../exception/exception';

const parseUid = (uid: string): number => {
  if (!uuid.validate(uid)) throw Exception.create(Exception.ErrorCode.UID_NOT_VALID);
  const uint8Array = uuid.parse(uid);
  let res = 0;
  Array.from(uint8Array).forEach(i => res += i);

  return res % 100;
}

export {
  parseUid
}
