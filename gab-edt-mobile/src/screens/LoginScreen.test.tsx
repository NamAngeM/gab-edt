import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Alert } from 'react-native';

// Mock du AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock API Client
jest.mock('../api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen Component', () => {
  const mockLogin = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders login form correctly', async () => {
    await render(<LoginScreen />);
    
    expect(await screen.findByText('Lycée National Léon Mba')).toBeTruthy();
    expect(await screen.findByText('Authentification')).toBeTruthy();
    
    expect(await screen.findByText('Matricule Élève / Parent')).toBeTruthy();
    expect(await screen.findByPlaceholderText('Ex : LMBA-2024-8942')).toBeTruthy();
  });

  it('switches input label and placeholder when selecting Teacher role', async () => {
    await render(<LoginScreen />);
    
    const teacherButton = await screen.findByText('Enseignant');
    fireEvent.press(teacherButton);
    
    expect(await screen.findByText('Identifiant Enseignant')).toBeTruthy();
    expect(await screen.findByPlaceholderText('Ex : PROF-2024-...')).toBeTruthy();
  });

  it('disables login button if inputs are empty', async () => {
    await render(<LoginScreen />);
    
    const loginButton = await screen.findByText('Se connecter à mon espace');
    fireEvent.press(loginButton);
    
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('calls login function on successful API response', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        token: 'fake-jwt-token',
        role: 'STUDENT'
      }
    });

    await render(<LoginScreen />);
    
    const matriculeInput = await screen.findByPlaceholderText('Ex : LMBA-2024-8942');
    const passwordInput = await screen.findByPlaceholderText('••••••••••••');
    
    fireEvent.changeText(matriculeInput, 'LMBA-2024-1234');
    fireEvent.changeText(passwordInput, 'password123');
    
    const loginButton = await screen.findByText('Se connecter à mon espace');
    
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'LMBA-2024-1234',
        password: 'password123'
      });
      expect(mockLogin).toHaveBeenCalledWith('fake-jwt-token', 'STUDENT');
    });

    // Wait for the button state to revert from 'Connexion en cours...' to ensure finally block completes
    await screen.findByText('Se connecter à mon espace');
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  it.skip('shows an alert on login failure', async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce({
      response: {
        data: {
          message: 'Identifiants incorrects.'
        }
      }
    });

    await render(<LoginScreen />);
    
    const matriculeInput = await screen.findByPlaceholderText('Ex : LMBA-2024-8942');
    const passwordInput = await screen.findByPlaceholderText('••••••••••••');
    
    fireEvent.changeText(matriculeInput, 'wrong-user');
    fireEvent.changeText(passwordInput, 'wrong-pass');
    
    const loginButton = await screen.findByText('Se connecter à mon espace');
    
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erreur de connexion', 'Identifiants incorrects.');
    });

    // Wait for the button state to revert from 'Connexion en cours...' to ensure finally block completes
    await screen.findByText('Se connecter à mon espace');
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });
});
