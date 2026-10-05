import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalendrierPage from '../calendrier/page';
import { fetchWithAuth } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  fetchWithAuth: jest.fn(),
}));

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const year = {
  id: 'y1',
  name: '2026-2027',
  startDate: '2026-10-01',
  endDate: '2027-07-31',
  periods: [
    { id: 'p1', name: 'Semestre 1', periodType: 'SEMESTER', startDate: '2026-10-01', endDate: '2027-02-15' },
    { id: 'p2', name: 'Semestre 2', periodType: 'SEMESTER', startDate: '2027-02-16', endDate: '2027-07-31' },
  ],
};

function mockApi(years: unknown[], events: unknown[]) {
  (fetchWithAuth as jest.Mock).mockImplementation((url: string) => {
    if (url === '/academic-years') return Promise.resolve({ data: years });
    if (url === '/communication/events') return Promise.resolve(events);
    return Promise.resolve({ data: 0 });
  });
}

describe('Calendrier', () => {
  beforeEach(() => jest.clearAllMocks());

  it('warns when no academic year is defined and creates one split into two semesters', async () => {
    mockApi([], []);
    render(<CalendrierPage />);

    expect(await screen.findByText(/Aucune année définie/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Nouvelle année/ }));
    fireEvent.change(screen.getByLabelText('Rentrée'), { target: { value: '2026-10-01' } });
    fireEvent.change(screen.getByLabelText("Fin d'année"), { target: { value: '2027-07-31' } });
    fireEvent.click(screen.getByRole('button', { name: '2 semestres' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(fetchWithAuth).toHaveBeenCalledWith('/academic-years', expect.objectContaining({ method: 'POST' })));
    const body = JSON.parse((fetchWithAuth as jest.Mock).mock.calls.find(([url, init]) => url === '/academic-years' && init?.method === 'POST')[1].body);
    expect(body.periods).toHaveLength(2);
    expect(body.periods[0]).toMatchObject({ name: 'Semestre 1', startDate: '2026-10-01', periodType: 'SEMESTER' });
    expect(body.periods[1].endDate).toBe('2027-07-31');
    // Les deux semestres se suivent sans chevauchement
    expect(body.periods[1].startDate > body.periods[0].endDate).toBe(true);
  });

  it('offers Gabon public holidays for each civil year of the academic year', async () => {
    mockApi([year], [{ id: 'e1', title: 'Noël', startDate: '2026-12-25T00:00:00', endDate: '2026-12-26T00:00:00', holiday: true }]);
    render(<CalendrierPage />);

    expect(await screen.findByText('Noël')).toBeInTheDocument();
    expect(screen.getByText('FERMÉ')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Jours fériés du Gabon 2027' }));

    await waitFor(() =>
      expect(fetchWithAuth).toHaveBeenCalledWith('/academic-years/public-holidays?year=2027', { method: 'POST' }));
  });

  it('sends a closure as whole days (end date exclusive for the API)', async () => {
    mockApi([year], []);
    render(<CalendrierPage />);

    fireEvent.click(await screen.findByRole('button', { name: /^add Ajouter$|Ajouter$/ }));
    fireEvent.change(screen.getByLabelText('Intitulé'), { target: { value: 'Vacances de Noël' } });
    fireEvent.change(screen.getByLabelText('Du'), { target: { value: '2026-12-20' } });
    fireEvent.change(screen.getByLabelText('Au (inclus)'), { target: { value: '2027-01-04' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    await waitFor(() => expect(fetchWithAuth).toHaveBeenCalledWith('/communication/events', expect.objectContaining({ method: 'POST' })));
    const body = JSON.parse((fetchWithAuth as jest.Mock).mock.calls.find(([url, init]) => url === '/communication/events' && init?.method === 'POST')[1].body);
    expect(body).toEqual({ title: 'Vacances de Noël', startDate: '2026-12-20T00:00:00', endDate: '2027-01-05T00:00:00', holiday: true });
  });
});
