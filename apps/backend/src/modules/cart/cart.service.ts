import mongoose from 'mongoose';
import { CartModel } from './cart.model.js';
import type { ReplaceCartInput, AddCartItemInput, UpdateCartItemInput } from './cart.validation.js';

function createError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

function formatCart(cart: {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: unknown[];
  updatedAt: Date;
}) {
  const items = (cart.items as Array<Record<string, unknown>>).map((item) => ({
    id: (item._id as mongoose.Types.ObjectId).toString(),
    productId: (item.productId as mongoose.Types.ObjectId).toString(),
    variantId: item.variantId as string,
    quantity: item.quantity as number,
    addedAt: (item.addedAt as Date)?.toISOString?.(),
  }));
  return {
    id: cart._id.toString(),
    userId: cart.userId.toString(),
    items,
    updatedAt: cart.updatedAt.toISOString(),
  };
}

export async function getCart(userId: string) {
  let cart = await CartModel.findOne({ userId });
  if (!cart) {
    cart = await CartModel.create({ userId, items: [] });
  }
  return formatCart(cart.toObject());
}

export async function replaceCart(userId: string, input: ReplaceCartInput) {
  const items = input.items.map((item) => ({
    productId: new mongoose.Types.ObjectId(item.productId),
    variantId: item.variantId,
    quantity: item.quantity,
    addedAt: new Date(),
  }));

  const cart = await CartModel.findOneAndUpdate(
    { userId },
    { $set: { items } },
    { new: true, upsert: true }
  );
  return formatCart(cart.toObject());
}

export async function addCartItem(userId: string, input: AddCartItemInput) {
  let cart = await CartModel.findOne({ userId });
  if (!cart) {
    cart = await CartModel.create({ userId, items: [] });
  }

  // Check if item with same productId and variantId exists
  const existingIdx = cart.items.findIndex(
    (i) => i.productId.toString() === input.productId && i.variantId === input.variantId
  );

  if (existingIdx >= 0) {
    // Update quantity
    cart.items[existingIdx].quantity += input.quantity;
  } else {
    // Add new item
    cart.items.push({
      productId: new mongoose.Types.ObjectId(input.productId),
      variantId: input.variantId,
      quantity: input.quantity,
      addedAt: new Date(),
    } as never);
  }

  await cart.save();
  return formatCart(cart.toObject());
}

export async function updateCartItem(userId: string, itemId: string, input: UpdateCartItemInput) {
  const cart = await CartModel.findOne({ userId });
  if (!cart) throw createError('Cart not found', 404);

  const item = cart.items.id(itemId);
  if (!item) throw createError('Cart item not found', 404);

  item.quantity = input.quantity;
  await cart.save();
  return formatCart(cart.toObject());
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await CartModel.findOne({ userId });
  if (!cart) throw createError('Cart not found', 404);

  const item = cart.items.id(itemId);
  if (!item) throw createError('Cart item not found', 404);

  item.deleteOne();
  await cart.save();
  return formatCart(cart.toObject());
}

export async function clearCart(userId: string) {
  await CartModel.findOneAndUpdate({ userId }, { $set: { items: [] } });
}
