import { expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import Cart from '../src/components/Cart';
import { BrowserRouter } from 'react-router-dom';

const mockCartItems = [
  {
    id: 1,
    name: 'LED Bulb',
    price: 9.99,
    quantity: 2,
    image: 'led-bulb.jpg'
  },
  {
    id: 2,
    name: 'Power Strip',
    price: 19.99,
    quantity: 1,
    image: 'power-strip.jpg'
  }
];

describe('Cart Component', () => {
  test('renders cart with items', () => {
    render(
      <BrowserRouter>
        <Cart items={mockCartItems} />
      </BrowserRouter>
    );

    expect(screen.getByText('LED Bulb')).toBeInTheDocument();
    expect(screen.getByText('Power Strip')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
  });

  test('calculates total correctly', () => {
    render(
      <BrowserRouter>
        <Cart items={mockCartItems} />
      </BrowserRouter>
    );

    // Total should be (9.99 * 2) + 19.99 = 39.97
    expect(screen.getByText(/total: \$39.97/i)).toBeInTheDocument();
  });

  test('updates quantity correctly', () => {
    const updateQuantity = jest.fn();
    render(
      <BrowserRouter>
        <Cart items={mockCartItems} onUpdateQuantity={updateQuantity} />
      </BrowserRouter>
    );

    const incrementButton = screen.getAllByRole('button', { name: /\+/i })[0];
    fireEvent.click(incrementButton);

    expect(updateQuantity).toHaveBeenCalledWith(1, 3);
  });

  test('removes item from cart', () => {
    const removeItem = jest.fn();
    render(
      <BrowserRouter>
        <Cart items={mockCartItems} onRemoveItem={removeItem} />
      </BrowserRouter>
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);

    expect(removeItem).toHaveBeenCalledWith(1);
  });
}); 