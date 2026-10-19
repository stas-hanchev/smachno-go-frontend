import { render, screen } from '@testing-library/react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useSessionStore } from '@/stores/session';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const user = {
  id: 1,
  email: 'a@b.c',
  emailVerified: true,
  firstName: 'Олена',
  lastName: null,
  phone: null,
  avatarUrl: null,
  role: 'customer' as const,
  homeLat: null,
  homeLng: null,
  homeAddress: null,
  searchRadiusKm: 5,
  cityId: null,
};

describe('RequireAuth', () => {
  beforeEach(() => {
    replace.mockReset();
    useSessionStore.setState({ user: null, accessToken: null, ready: false });
  });

  it('waits for the session check before redirecting', () => {
    render(<RequireAuth>secret</RequireAuth>);
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects guests to login with the current path', () => {
    window.history.pushState({}, '', '/orders?status=active');
    useSessionStore.setState({ ready: true });
    render(<RequireAuth>secret</RequireAuth>);
    expect(replace).toHaveBeenCalledWith('/login?next=%2Forders%3Fstatus%3Dactive');
  });

  it('renders children for a signed-in user', () => {
    useSessionStore.setState({ ready: true, user, accessToken: 'token' });
    render(<RequireAuth>secret</RequireAuth>);
    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});
