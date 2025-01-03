export default function Cart({ items, onUpdateQuantity, onRemoveItem }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>${item.price}</p>
          <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
          <span>{item.quantity}</span>
          <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
          <button onClick={() => onRemoveItem(item.id)}>Remove</button>
        </div>
      ))}
      <div>Total: ${total.toFixed(2)}</div>
    </div>
  );
} 