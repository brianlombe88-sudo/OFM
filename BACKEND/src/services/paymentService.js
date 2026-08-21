// Payment gateway abstraction
// For MVP, this is a mock that returns a success transaction ID
// Later, integrate with Stripe, Paypal, Flutterwave, etc

function generatePaymentRef() {
  return `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function processPayment(amount, method = 'mobile_money') {
  // Mock payment processing
  // In production, call actual payment gateway API
  return {
    ref: generatePaymentRef(),
    amount,
    method,
    status: 'success',
    timestamp: new Date()
  };
}

async function verifyPayment(ref) {
  // Mock verification
  // In production, query payment gateway for transaction status
  return { ref, status: 'confirmed', verified: true };
}

module.exports = {
  processPayment,
  verifyPayment,
  generatePaymentRef
};
