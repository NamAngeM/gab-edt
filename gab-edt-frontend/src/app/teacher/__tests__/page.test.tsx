import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeacherDashboard from '../page';
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

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

describe('TeacherDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ firstName: 'Bob' }));
    jest.useFakeTimers().setSystemTime(new Date('2023-10-10T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading state initially', async () => {
    (fetchWithAuth as jest.Mock).mockResolvedValue({ data: [] });
    render(<TeacherDashboard />);
    expect(await screen.findByText(/Bonjour, Bob/i)).toBeInTheDocument();
  });

  it('renders teacher schedule after loading', async () => {
    const schedule = {
      data: [
        {
          id: '1',
          title: 'Physique Quantique',
          subject: { name: 'Physique' },
          room: { name: 'Labo 42' },
          group: { name: 'Groupe A' },
          startAt: '2023-10-10T10:00:00Z',
          endAt: '2023-10-10T12:00:00Z',
        },
        {
          id: '2',
          title: 'Algorithmique',
          subject: { name: 'Informatique' },
          room: { name: 'Salle TD' },
          group: { name: 'Groupe B' },
          startAt: '2023-10-10T14:00:00Z',
          endAt: '2023-10-10T16:00:00Z',
        }
      ]
    };
    const teachingHours = {
      data: [{
        id: 'c1', subject: { name: 'Mécanique' }, group: { name: 'Terminale C' },
        plannedHours: 40, doneHours: 10, scheduledHours: 20, toMakeUpHours: 2,
      }],
    };
    (fetchWithAuth as jest.Mock).mockImplementation((url: string) =>
      Promise.resolve(url.startsWith('/courses/mine') ? teachingHours : schedule));

    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Physique')).toBeInTheDocument();
      expect(screen.getByText('Informatique')).toBeInTheDocument();
    });

    expect(screen.getByText('Labo 42')).toBeInTheDocument();
    expect(screen.getByText('Salle TD')).toBeInTheDocument();
    expect(screen.getByText('Groupe A')).toBeInTheDocument();
    expect(screen.getByText('Groupe B')).toBeInTheDocument();

    // Volume horaire réel (et non plus des chiffres codés en dur)
    expect(await screen.findByText('Mécanique — Terminale C')).toBeInTheDocument();
    expect(screen.getByText('10 h / 40 h')).toBeInTheDocument();
    expect(screen.getByText('2 h à rattraper')).toBeInTheDocument();
  });

  it('handles empty events gracefully', async () => {
    (fetchWithAuth as jest.Mock).mockResolvedValue({ data: [] });
    
    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Aucun cours aujourd'hui/i)).toBeInTheDocument();
      expect(screen.getByText(/Vous n'avez pas de cours programmés pour cette journée/i)).toBeInTheDocument();
    });
  });
});
