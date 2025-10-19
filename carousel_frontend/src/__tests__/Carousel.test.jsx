import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Carousel from '../components/Carousel';

const slides = [
  { id: 'a', title: 'A', description: 'A desc', image: '/images/desktop.jpg' },
  { id: 'b', title: 'B', description: 'B desc', image: '/images/laptop.jpg' },
  { id: 'c', title: 'C', description: 'C desc', image: '/images/security.jpg' },
];

describe('Carousel', () => {
  test('renders slides and indicators', () => {
    render(<Carousel slides={slides} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /carousel controls/i })).toBeInTheDocument();
  });

  test('next and prev buttons update the active index counter', () => {
    render(<Carousel slides={slides} />);
    const nextBtn = screen.getByRole('button', { name: /next slide/i });
    const prevBtn = screen.getByRole('button', { name: /previous slide/i });

    // Starts at 1/3
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();

    // Next -> 2/3
    fireEvent.click(nextBtn);
    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();

    // Prev -> 1/3
    fireEvent.click(prevBtn);
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
  });

  test('keyboard navigation works with ArrowRight/ArrowLeft', () => {
    render(<Carousel slides={slides} />);
    // Send keydown to the section by focusing body; event bubbles
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
  });
});
