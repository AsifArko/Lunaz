import type { Id } from 'types/id';
import type { CartItem } from './CartItem';

/** Cart entity (logged-in user). */
export interface Cart {
  id: Id;
  userId: Id;
  items: CartItem[];
  updatedAt: string;
}
