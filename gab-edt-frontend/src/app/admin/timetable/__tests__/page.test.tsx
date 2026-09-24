import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimetablePage from '../page';
import { fetchWithAuth } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  fetchWithAuth: jest.fn(),
}));

jest.mock('@/app/components/TimetableModal', () => ({
  TimetableModal: () => <div data-testid="timetable-modal">Mock Modal</div>
}));

describe('Admin TimetablePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2023-10-10T12:00:00Z')); // Mardi 10 Octobre 2023
    
    // Mock the api calls
    (fetchWithAuth as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/resources/tree')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/schedule-events')) {
        return Promise.resolve({
          data: [
            {
              id: '1',
              subject: { name: 'Algèbre Linéaire' },
              teacher: { firstName: 'Jean', lastName: 'Dupont' },
              room: { name: 'Amphi A' },
              group: { name: 'L1 Info' },
              startAt: '2023-10-10T08:00:00Z',
              endAt: '2023-10-10T10:00:00Z',
              status: 'SCHEDULED'
            }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the timetable grid', async () => {
    render(<TimetablePage />);
    
    // Week days header (Lun, Mar, etc.)
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
    expect(screen.getByText('08h00')).toBeInTheDocument();
  });

  it('loads and displays events', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Algèbre Linéaire')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('Amphi A')).toBeInTheDocument();
  });
});
