import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentDashboardPage from '../page';
import { fetchWithAuth } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  fetchWithAuth: jest.fn(),
  extractArray: (data: any) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && data.content && Array.isArray(data.content)) return data.content;
    return [];
  },
}));

describe('StudentDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ firstName: 'Alice' }));
    jest.useFakeTimers().setSystemTime(new Date('2023-10-10T12:00:00Z'));
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading state initially', async () => {
    (fetchWithAuth as jest.Mock).mockResolvedValue({ data: [] });
    render(<StudentDashboardPage />);
    expect(screen.getByText(/Bonjour, Alice/i)).toBeInTheDocument();
  });

  it('renders student schedule and announcements after loading', async () => {
    (fetchWithAuth as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/schedule-events')) {
        return Promise.resolve({
          data: [
            {
              id: '1',
              title: 'Mathématiques',
              roomName: 'Salle 101',
              teacherName: 'Prof. Dubois',
              startAt: '2023-10-10T08:00:00Z',
              endAt: '2023-10-10T10:00:00Z',
            },
            {
              id: '2',
              title: 'Informatique',
              roomName: 'Labo 1',
              teacherName: 'Prof. Turing',
              startAt: '2023-10-10T14:00:00Z',
              endAt: '2023-10-10T16:00:00Z',
            }
          ]
        });
      }
      if (url.includes('/communication/announcements')) {
        return Promise.resolve({
          data: [
            {
              id: '1',
              title: 'Fermeture bâtiment',
              content: 'Le bâtiment C sera fermé.',
              targetAudience: 'ALL',
              createdAt: '2023-10-09T10:00:00Z'
            }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(<StudentDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathématiques')).toBeInTheDocument();
      expect(screen.getByText('Informatique')).toBeInTheDocument();
      expect(screen.getByText('Fermeture bâtiment')).toBeInTheDocument();
    });

    expect(screen.getByText('Salle 101')).toBeInTheDocument();
    expect(screen.getByText('Prof. Dubois')).toBeInTheDocument();
  });

  it('handles empty events and announcements gracefully', async () => {
    (fetchWithAuth as jest.Mock).mockResolvedValue({ data: [] });
    
    render(<StudentDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Aucun cours aujourd'hui/i)).toBeInTheDocument();
      expect(screen.getByText(/Aucune annonce récente/i)).toBeInTheDocument();
    });
  });
});
