import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './page';

// Mock du router Next.js
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  it('renders the login form with default admin role', () => {
    render(<LoginPage />);
    
    // Titre de l'app (il y en a deux : dans le header et le footer)
    expect(screen.getAllByText('GAB-EDT').length).toBeGreaterThan(0);
    
    // Le rôle Admin est sélectionné par défaut
    const adminButton = screen.getByRole('tab', { name: /Admin/i });
    expect(adminButton).toHaveAttribute('aria-selected', 'true');
    
    // Vérifier les labels par défaut pour l'admin
    expect(screen.getByText('Adresse email institutionnelle')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@etablissement.ga')).toBeInTheDocument();
  });

  it('changes input label and placeholder when selecting different roles', () => {
    render(<LoginPage />);
    
    // Changer pour Enseignant
    const teacherButton = screen.getByRole('tab', { name: /Enseignant/i });
    fireEvent.click(teacherButton);
    
    expect(screen.getByText('Identifiant enseignant ou email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('prenom.nom@univ-edu.ga')).toBeInTheDocument();
    
    // Changer pour Etudiant
    const studentButton = screen.getByRole('tab', { name: /Étudiant/i });
    fireEvent.click(studentButton);
    
    expect(screen.getByText("Email de l'étudiant")).toBeInTheDocument();
    expect(screen.getByPlaceholderText('prenom.nom@etudiant.ga')).toBeInTheDocument();
  });

  it('shows error messages for empty fields on submit', async () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Veuillez saisir votre identifiant.')).toBeInTheDocument();
      expect(screen.getByText('Veuillez saisir votre mot de passe.')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    render(<LoginPage />);
    
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Pour trouver le bouton de visibilité de mot de passe, cherchons le bouton juste après l'input
    // Ou via un aria-label, mais comme il n'y en a pas, on filtre les boutons par type='button' et on élimine les tabs
    const toggleButtons = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('type') === 'button' && btn.getAttribute('role') !== 'tab' &&
      !btn.textContent?.includes('ENT')
    );
    
    const toggleButton = toggleButtons[0];
    
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
    
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  it('handles successful login and redirects based on role', async () => {
    const mockUserData = { id: 1, role: 'STUDENT', roles: ['ROLE_STUDENT'] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockUserData,
        token: 'fake-jwt-token'
      }),
    });

    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('admin@etablissement.ga'); // default
    const passwordInput = screen.getByPlaceholderText('••••••••');
    
    fireEvent.change(emailInput, { target: { value: 'student@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'student@test.com', password: 'password123' })
      }));
      expect(localStorage.getItem('jwt_token')).toBe('fake-jwt-token');
      expect(localStorage.getItem('user_data')).toBe(JSON.stringify(mockUserData));
      expect(mockPush).toHaveBeenCalledWith('/student');
    });
  });

  it('handles login failure and shows server error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid credentials'
      }),
    });

    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('admin@etablissement.ga');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    
    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
