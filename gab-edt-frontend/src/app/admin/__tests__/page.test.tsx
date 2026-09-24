import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboardPage from '../page';
import { fetchWithAuth } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  fetchWithAuth: jest.fn(),
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ firstName: 'Admin Test' }));
  });

  it('renders loading state initially', async () => {
    (fetchWithAuth as jest.Mock).mockResolvedValueOnce({ data: {} });
    render(<AdminDashboardPage />);
    expect(screen.getByText(/Bonjour, Admin Test/i)).toBeInTheDocument();
  });

  it('renders dashboard stats after loading', async () => {
    const mockStats = {
      teacherCount: 42,
      studentCount: 1500,
      subjectCount: 30,
      roomCount: 100,
      activeConflictsCount: 2,
      todayEvents: [
        {
          id: '1',
          title: 'Maths',
          description: 'Algèbre',
          roomName: 'Amphi A',
          startAt: '2023-10-10T08:00:00Z',
          endAt: '2023-10-10T10:00:00Z',
          conflict: true
        }
      ],
      recentActivity: [
        {
          icon: 'info',
          text: 'Activité 1',
          time: '2023-10-10T09:00:00Z',
          type: 'INFO'
        }
      ],
      buildingOccupations: [
        {
          name: 'Bâtiment A',
          sub: 'Sciences',
          pct: 80,
          occupied: '800',
          free: '200',
          color: 'green'
        }
      ]
    };

    (fetchWithAuth as jest.Mock).mockResolvedValueOnce({ data: mockStats });
    
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument(); // teacherCount
      expect(screen.getByText('1500')).toBeInTheDocument(); // studentCount
      expect(screen.getByText('30')).toBeInTheDocument(); // subjectCount
      expect(screen.getByText('100')).toBeInTheDocument(); // roomCount
      expect(screen.getByText('2')).toBeInTheDocument(); // activeConflictsCount
    });

    // Check conflict
    expect(screen.getByText(/Amphi A — Maths/i)).toBeInTheDocument();
    
    // Check activity
    expect(screen.getByText('Activité 1')).toBeInTheDocument();

    // Check building occupation
    expect(screen.getByText('Bâtiment A')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('renders empty states gracefully on error', async () => {
    (fetchWithAuth as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucun conflit actif pour le moment.')).toBeInTheDocument();
      expect(screen.getByText('Aucun événement prévu aujourd\'hui.')).toBeInTheDocument();
      expect(screen.getByText('Aucune activité récente.')).toBeInTheDocument();
    });
  });
});
