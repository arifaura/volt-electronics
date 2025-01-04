import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Products from '../src/pages/Products';
import { CartProvider } from '../src/context/CartContext';
import { AuthProvider } from '../src/context/AuthContext';

describe('Products Component', () => {
  const renderProducts = () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Products />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('filters products by search query', async () => {
    renderProducts();
    
    const searchInput = screen.getByPlaceholderText(/search products/i);
    fireEvent.change(searchInput, { target: { value: 'laptop' } });

    await waitFor(() => {
      const products = screen.getAllByRole('article');
      expect(products.length).toBeGreaterThan(0);
    });
  });

  test('sorts products by price', async () => {
    renderProducts();
    
    const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
    fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

    await waitFor(() => {
      const products = screen.getAllByRole('article');
      const prices = products.map(p => 
        parseFloat(p.querySelector('[data-testid="price"]').textContent.replace('$', ''))
      );
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });
  });

  test('filters products by price range', async () => {
    renderProducts();
    
    const priceRange = screen.getByRole('slider');
    fireEvent.change(priceRange, { target: { value: '500' } });

    await waitFor(() => {
      const products = screen.getAllByRole('article');
      const prices = products.map(p => 
        parseFloat(p.querySelector('[data-testid="price"]').textContent.replace('$', ''))
      );
      expect(Math.max(...prices)).toBeLessThanOrEqual(500);
    });
  });
}); 