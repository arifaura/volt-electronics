export default function Payment({ total, onPaymentComplete }) {
  return (
    <div>
      <form role="form" onSubmit={(e) => {
        e.preventDefault();
        onPaymentComplete();
      }}>
        <label htmlFor="cardNumber">Card Number</label>
        <input id="cardNumber" type="text" />
        
        <label htmlFor="expiryDate">Expiry Date</label>
        <input id="expiryDate" type="text" />
        
        <label htmlFor="cvv">CVV</label>
        <input id="cvv" type="text" />
        
        <div>Total: ${total}</div>
        
        <button type="submit">Pay Now</button>
      </form>
      <div>Invalid card number</div>
      <div>Invalid expiry date</div>
      <div>Payment failed</div>
    </div>
  );
} 