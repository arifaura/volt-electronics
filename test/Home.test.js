import { expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Home from '../src/components/Home';
import { BrowserRouter } from 'react-router-dom';

describe('Home Component', () => {
  test('renders home component with welcome message', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/welcome to our website/i)).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/about/i)).toBeInTheDocument();
    expect(screen.getByText(/contact/i)).toBeInTheDocument();
  });
}); 