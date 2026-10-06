import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisponibilitesPage from '../disponibilites/page';
import { fetchWithAuth } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  fetchWithAuth: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const teachers = {
  data: {
    content: [
      { id: 't1', firstName: 'Jean', lastName: 'Dupont' },
      { id: 't2', firstName: 'Marie', lastName: 'Ndong' },
    ],
  },
};

function mockApi(availabilities: unknown[] = []) {
  (fetchWithAuth as jest.Mock).mockImplementation((url: string) => {
    if (url.startsWith('/teachers/') && url.endsWith('/availabilities'))
      return Promise.resolve({ data: availabilities });
    if (url.startsWith('/teachers'))
      return Promise.resolve(teachers);
    return Promise.resolve({ data: [] });
  });
}

describe('Disponibilités', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows teacher selector and loads slots on selection', async () => {
    mockApi([]);
    render(<DisponibilitesPage />);

    const select = await screen.findByRole('combobox');
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    fireEvent.change(select, { target: { value: 't1' } });

    await waitFor(() =>
      expect(fetchWithAuth).toHaveBeenCalledWith('/teachers/t1/availabilities'));
    expect(await screen.findByText(/Ajouter un créneau/)).toBeInTheDocument();
  });

  it('can add a slot and save', async () => {
    mockApi([]);

    render(<DisponibilitesPage />);
    fireEvent.change(await screen.findByRole('combobox'), { target: { value: 't1' } });

    await waitFor(() => expect(screen.getByText(/Ajouter un créneau/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Ajouter un créneau/ }));
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() =>
      expect(fetchWithAuth).toHaveBeenCalledWith(
        '/teachers/t1/availabilities',
        expect.objectContaining({ method: 'PUT' }),
      ));
  });

  it('displays existing slots for a vacataire', async () => {
    const slotsData = [
      { id: 'a1', dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '12:00' },
      { id: 'a2', dayOfWeek: 'WEDNESDAY', startTime: '08:00', endTime: '17:00' },
    ];
    (fetchWithAuth as jest.Mock).mockImplementation((url: string) => {
      if (url.startsWith('/teachers/') && url.endsWith('/availabilities'))
        return Promise.resolve({ data: slotsData });
      if (url.startsWith('/teachers'))
        return Promise.resolve(teachers);
      return Promise.resolve({ data: [] });
    });

    render(<DisponibilitesPage />);
    fireEvent.change(await screen.findByRole('combobox'), { target: { value: 't2' } });

    await waitFor(() => expect(screen.getByText(/2 créneau/)).toBeInTheDocument());
  });

  it('applies a preset', async () => {
    mockApi([]);
    render(<DisponibilitesPage />);
    fireEvent.change(await screen.findByRole('combobox'), { target: { value: 't1' } });

    await waitFor(() => expect(screen.getByText(/Ajouter un créneau/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Lun-Mer-Ven' }));
    expect(screen.getByText(/3 créneau/)).toBeInTheDocument();
  });
});
