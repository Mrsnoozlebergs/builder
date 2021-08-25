import { UserAuthority } from '../entity/user';

export interface UserDTO {
  userPassword?: string;
  id?: number;
  userName?: string;
  userAuthority?: UserAuthority;
  userPhone?: string;
  userId?: string;
  token?: string;
  userHash?: number;
}