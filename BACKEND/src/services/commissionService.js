// Commission calculation service
const COMMISSION_RATE = process.env.COMMISSION_RATE || 0.01; // 1% default

function calculateCommission(amount) {
  return Math.round(amount * COMMISSION_RATE);
}

function calculateOrderTotals(productPrice, quantity, deliveryFee = 0) {
  const subtotal = productPrice * quantity;
  const platformFee = calculateCommission(subtotal);
  const deliveryFeeTax = calculateCommission(deliveryFee);
  const totalAmount = subtotal + platformFee + deliveryFee + deliveryFeeTax;
  
  return {
    subtotal,
    platformFee,
    deliveryFee,
    deliveryFeeTax,
    totalAmount,
    sellerReceives: subtotal
  };
}

module.exports = {
  calculateCommission,
  calculateOrderTotals
};
