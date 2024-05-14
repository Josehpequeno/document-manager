export interface User {
  id: string;
  master: boolean;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
}