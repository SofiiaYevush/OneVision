import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AdminDashboard from '@/pages/AdminDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

vi.mock('@/api/admin');
vi.mock('@/components/layout/DashboardLayout', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@/components/ui/Spinner', () => ({
  default: () => <div>Loading...</div>,
}));

const mockedAdminApi = adminApi as unknown as {
  getStats: ReturnType<typeof vi.fn>;
  listUsers: ReturnType<typeof vi.fn>;
  blockUser: ReturnType<typeof vi.fn>;
  unblockUser: ReturnType<typeof vi.fn>;
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: any) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const mockStats = {
  totalUsers: 10,
  totalPerformers: 5,
  totalBookings: 20,
  bookingsByStatus: {
    confirmed: 7,
    pending: 3,
  },
};

const mockUsers = {
  data: [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      role: 'client',
      isBlocked: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      role: 'admin',
      isBlocked: false,
      createdAt: new Date().toISOString(),
    },
  ],
};

describe('AdminDashboard (Vitest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedAdminApi.getStats.mockResolvedValue(mockStats as any);
    mockedAdminApi.listUsers.mockResolvedValue(mockUsers as any);
    mockedAdminApi.blockUser.mockResolvedValue({} as any);
    mockedAdminApi.unblockUser.mockResolvedValue({} as any);
  });

  it('renders dashboard title', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(await screen.findByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('displays stats correctly', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(await screen.findByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('shows bookings by status section', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(await screen.findByText('Bookings by Status')).toBeInTheDocument();
    expect(screen.getByText('confirmed')).toBeInTheDocument();
  });

  it('renders users table', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockedAdminApi.getStats.mockReturnValue(new Promise(() => {}));
    mockedAdminApi.listUsers.mockReturnValue(new Promise(() => {}));

    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('shows empty users state', async () => {
    mockedAdminApi.listUsers.mockResolvedValue({ data: [] } as any);

    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(await screen.findByText('No users found')).toBeInTheDocument();
  });

  it('filters users by role', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    const performerBtn = await screen.findByText('performer');
    fireEvent.click(performerBtn);

    await waitFor(() => {
      expect(mockedAdminApi.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'performer' })
      );
    });
  });

  it('searches users by email', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    const input = await screen.findByPlaceholderText('Search by email...');
    const button = screen.getByText('Search');

    fireEvent.change(input, { target: { value: 'john' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockedAdminApi.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'john' })
      );
    });
  });

  it('blocks user', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    const blockBtn = await screen.findByText('Block');
    fireEvent.click(blockBtn);

    await waitFor(() => {
      expect(mockedAdminApi.blockUser).toHaveBeenCalledWith('1');
    });
  });

  it('unblocks user', async () => {
    mockedAdminApi.listUsers.mockResolvedValue({
      data: [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          role: 'client',
          isBlocked: true,
          createdAt: new Date().toISOString(),
        },
      ],
    } as any);

    render(<AdminDashboard />, { wrapper: createWrapper() });

    const unblockBtn = await screen.findByText('Unblock');
    fireEvent.click(unblockBtn);

    await waitFor(() => {
      expect(mockedAdminApi.unblockUser).toHaveBeenCalledWith('1');
    });
  });

  it('does not show block button for admin users', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    await screen.findByText('Admin User');

    const buttons = screen.queryAllByText('Block');
    expect(buttons.length).toBe(1);
  });
});