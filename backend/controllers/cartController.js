import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// GET /api/cart
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(200).json({ success: true, items: [], subtotal: 0, shipping: 50, total: 50 });
  }

  const items = cart.items
    .filter(item => item.product) // skip orphaned items
    .map(item => ({
      id:        item.product._id,
      product_id: item.product._id,
      name:      item.product.name,
      price:     item.product.price,
      quantity:  item.quantity,
      image:     item.product.image,
      image_url: item.product.image,
      stock:     item.product.stock,
    }));

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 50;
  res.status(200).json({ success: true, items, subtotal, shipping, total: subtotal + shipping });
};

// POST /api/cart/add
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate("items.product");

  const items = cart.items
    .filter(item => item.product)
    .map(item => ({
      id:        item.product._id,
      product_id: item.product._id,
      name:      item.product.name,
      price:     item.product.price,
      quantity:  item.quantity,
      image:     item.product.image,
      image_url: item.product.image,
      stock:     item.product.stock,
    }));
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 50;
  res.status(200).json({ success: true, message: "Item added to cart!", items, subtotal, shipping, total: subtotal + shipping });
};

// PUT /api/cart/update
export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

  const item = cart.items.find((item) => item.product.toString() === productId);
  if (!item) return res.status(404).json({ success: false, message: "Item not in cart." });

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate("items.product");

  const items = cart.items
    .filter(item => item.product)
    .map(item => ({
      id:        item.product._id,
      product_id: item.product._id,
      name:      item.product.name,
      price:     item.product.price,
      quantity:  item.quantity,
      image:     item.product.image,
      image_url: item.product.image,
      stock:     item.product.stock,
    }));
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 50;
  res.status(200).json({ success: true, items, subtotal, shipping, total: subtotal + shipping });
};

// DELETE /api/cart/remove/:productId
export const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate("items.product");

  const items = cart.items
    .filter(item => item.product)
    .map(item => ({
      id:        item.product._id,
      product_id: item.product._id,
      name:      item.product.name,
      price:     item.product.price,
      quantity:  item.quantity,
      image:     item.product.image,
      image_url: item.product.image,
      stock:     item.product.stock,
    }));
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 50;
  res.status(200).json({ success: true, items, subtotal, shipping, total: subtotal + shipping });
};

// DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.status(200).json({ success: true, message: "Cart cleared." });
};
