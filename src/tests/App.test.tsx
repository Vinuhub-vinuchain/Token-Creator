import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('renders connect wallet button', () => {
    render(<App />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('displays validation error for empty token name', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Deploy Token/));
    expect(screen.getByText('Token name is required.')).toBeInTheDocument();
  });
});
