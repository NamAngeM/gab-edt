import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './page';

const mockPush = jest.fn();
let mockSearch = '';
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

const loginResponse = (role: string, ok = true, message?: string) => ({
  ok,
  status: ok ? 200 : 401,
  json: jest.fn().mockResolvedValue(ok ? { data: { email: 'x@y.ga', firstName: 'Ana', role } } : { message }),
});

async function submit(identifier = 'admin@ecole.com', password = 'secret') {
  fireEvent.change(screen.getByLabelText('Email ou matricule'), { target: { value: identifier } });
  fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockSearch = '';
    global.fetch = jest.fn();
  });

  it('shows a single identifier field (no role picker)', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText('Email ou matricule')).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('validates empty fields', async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText('Veuillez saisir votre email ou votre matricule.')).toBeInTheDocument();
      expect(screen.getByText('Veuillez saisir votre mot de passe.')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(<LoginPage />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it.each([
    ['SCHOOL_ADMIN', '/admin'],
    ['TEACHER', '/teacher'],
    ['STUDENT', '/student'],
    ['PARENT', '/student'],
    ['SUPER_ADMIN', '/super-admin'],
  ])('redirects %s to %s and never stores a token in the browser', async (role, home) => {
    (global.fetch as jest.Mock).mockResolvedValue(loginResponse(role));
    render(<LoginPage />);

    await submit();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(home));
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(JSON.parse(localStorage.getItem('user_data') || '{}').role).toBe(role);
  });

  it('follows ?next only inside the role area', async () => {
    mockSearch = 'next=/super-admin/settings';
    (global.fetch as jest.Mock).mockResolvedValue(loginResponse('SCHOOL_ADMIN'));
    render(<LoginPage />);

    await submit();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/admin'));
  });

  it('shows the server error message', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(loginResponse('', false, 'Trop de tentatives de connexion.'));
    render(<LoginPage />);

    await submit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Trop de tentatives de connexion.');
    expect(mockPush).not.toHaveBeenCalled();
  });
});
