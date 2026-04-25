/** POST /auth/register */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}
