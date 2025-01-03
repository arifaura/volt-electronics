import { expect } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Payment from '../src/components/Payment';
import { BrowserRouter } from 'react-router-dom';

describe('Payment Component', () => {
  const mockTotal = 39.97;
  const mockOnPaymentComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders payment form', () => {
    render(
      <BrowserRouter>
        <Payment total={mockTotal} onPaymentComplete={mockOnPaymentComplete} />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
    expect(screen.getByText(`Total: $${mockTotal}`)).toBeInTheDocument();
  });

  test('validates card number format', async () => {
    render(
      <BrowserRouter>
        <Payment total={mockTotal} onPaymentComplete={mockOnPaymentComplete} />
      </BrowserRouter>
    );

    const cardInput = screen.getByLabelText(/card number/i);
    fireEvent.change(cardInput, { target: { value: '1234' } });
    fireEvent.blur(cardInput);

    await waitFor(() => {
      expect(screen.getByText(/invalid card number/i)).toBeInTheDocument();
    });
  });

  test('validates expiry date', async () => {
    render(
      <BrowserRouter>
        <Payment total={mockTotal} onPaymentComplete={mockOnPaymentComplete} />
      </BrowserRouter>
    );

    const expiryInput = screen.getByLabelText(/expiry date/i);
    fireEvent.change(expiryInput, { target: { value: '13/23' } });
    fireEvent.blur(expiryInput);

    await waitFor(() => {
      expect(screen.getByText(/invalid expiry date/i)).toBeInTheDocument();
    });
  });

  test('processes payment successfully', async () => {
    render(
      <BrowserRouter>
        <Payment total={mockTotal} onPaymentComplete={mockOnPaymentComplete} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/card number/i), {
      target: { value: '4111111111111111' }
    });
    fireEvent.change(screen.getByLabelText(/expiry date/i), {
      target: { value: '12/25' }
    });
    fireEvent.change(screen.getByLabelText(/cvv/i), {
      target: { value: '123' }
    });

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnPaymentComplete).toHaveBeenCalled();
    });
  });

  test('displays error on payment failure', async () => {
    // Mock a failed payment
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.reject(new Error('Payment failed'))
    );

    render(
      <BrowserRouter>
        <Payment total={mockTotal} onPaymentComplete={mockOnPaymentComplete} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/card number/i), {
      target: { value: '4111111111111111' }
    });
    fireEvent.change(screen.getByLabelText(/expiry date/i), {
      target: { value: '12/25' }
    });
    fireEvent.change(screen.getByLabelText(/cvv/i), {
      target: { value: '123' }
    });

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
    });
  });
}); 