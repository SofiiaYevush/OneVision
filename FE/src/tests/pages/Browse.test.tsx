import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Browse from '@/pages/Browse';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockBrowse = vi.fn().mockResolvedValue({
  data: [
    {
      id: '1',
      category: 'photography',
      city: 'Kyiv',
      hourlyRate: 100,
      averageRating: 4.5,
      bio: 'Nice photographer',
      tags: ['wedding', 'portrait'],
      userId: { firstName: 'John', lastName: 'Doe' },
    },
  ],
  meta: { total: 1, totalPages: 1 },
});

vi.mock('@/api/performers', () => ({
  performersApi: {
    browse: (...args: any[]) => mockBrowse(...args),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [
      new URLSearchParams(),
      vi.fn(),
    ],
    Link: ({ children }: any) => <a>{children}</a>,
  };
});

vi.mock('@/components/layout/Navbar', () => ({
  default: () => <div data-testid="navbar" />,
}));

vi.mock('@/components/ui/Spinner', () => ({
  default: () => <div data-testid="spinner" />,
}));

vi.mock('@/components/ui/StarRating', () => ({
  default: () => <div data-testid="rating" />,
}));

// ---------- helper ----------
const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Browse />
    </QueryClientProvider>
  );
};

// ---------- tests ----------
describe('Browse page', () => {
  it('renders navbar and filters', () => {
    renderPage();

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search performers...')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('calls performersApi.browse on load', () => {
    renderPage();

    expect(mockBrowse).toHaveBeenCalled();
  });

  it('renders performers list', async () => {
    renderPage();

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('photography')).toBeInTheDocument();
    expect(screen.getByText('$100/hr')).toBeInTheDocument();
  });

  it('shows category buttons', () => {
    renderPage();

    expect(screen.getByText(/Photography/)).toBeInTheDocument();
    expect(screen.getByText(/Music & DJ/)).toBeInTheDocument();
    expect(screen.getByText(/Event Hosting/)).toBeInTheDocument();
  });

  it('changes rating filter state', () => {
    renderPage();

    const radio = screen.getAllByRole('radio')[2];
    fireEvent.click(radio);

    expect(radio).toBeChecked();
  });

  it('shows no results state when empty', async () => {
    mockBrowse.mockResolvedValueOnce({
      data: [],
      meta: { total: 0, totalPages: 0 },
    });

    renderPage();

    expect(await screen.findByText('No performers found')).toBeInTheDocument();
  });
});