import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Computer Show heading and carousel', () => {
  render(<App />);
  expect(screen.getByText(/Computer Show/i)).toBeInTheDocument();
  // counter like "1 / 4" appears
  expect(screen.getByText(/1 \/ \d+/)).toBeInTheDocument();
});
