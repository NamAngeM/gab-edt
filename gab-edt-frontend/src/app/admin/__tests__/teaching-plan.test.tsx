import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnseignementsPage from '../enseignements/page';
import RattrapagesPage from '../rattrapages/page';
import { fetchWithAuth } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  fetchWithAuth: jest.fn(),
}));

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

// La modale de planification a ses propres dépendances : on vérifie seulement qu'elle reçoit la séance
jest.mock('@/app/components/TimetableModal', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TimetableModal: ({ isOpen, makeUpOf }: any) =>
    isOpen ? <div role="dialog">Rattrapage de {makeUpOf?.subject?.name}</div> : null,
}));

const course = {
  id: 'c1',
  subject: { id: 's1', name: 'Philosophie' },
  teacher: { id: 't1', firstName: 'Jean', lastName: 'Mba' },
  group: { id: 'g1', name: 'Terminale A' },
  plannedHours: 60,
  scheduledHours: 30,
  doneHours: 20,
  cancelledHours: 4,
  madeUpHours: 2,
  toMakeUpHours: 2,
  remainingHours: 30,
};

const cancelled = {
  id: 'e1',
  subject: { id: 's1', name: 'Philosophie' },
  teacher: { id: 't1', firstName: 'Jean', lastName: 'Mba' },
  group: { id: 'g1', name: 'Terminale A' },
  startAt: '2026-10-12T08:00:00',
  endAt: '2026-10-12T10:00:00',
  notes: 'Grève',
};

function mockApi(routes: Record<string, unknown>) {
  (fetchWithAuth as jest.Mock).mockImplementation((url: string) => {
    const key = Object.keys(routes).find((prefix) => url.startsWith(prefix));
    return Promise.resolve(key ? routes[key] : []);
  });
}

describe('Enseignements', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows planned vs done hours and the hours to make up', async () => {
    mockApi({ '/courses': { data: [course] } });

    render(<EnseignementsPage />);

    expect(await screen.findByText('Philosophie')).toBeInTheDocument();
    expect(screen.getByText('20 h / 60 h')).toBeInTheDocument();
    expect(screen.getByText('reste 30 h à poser')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /2 h à rattraper/ })).toHaveAttribute('href', '/admin/rattrapages');
  });

  it('creates a teaching assignment with its planned volume', async () => {
    mockApi({
      '/courses': { data: [] },
      '/org-units': [{ id: 'g1', name: 'Terminale A', type: 'CLASS' }],
      '/subjects': { data: [{ id: 's1', name: 'Philosophie' }] },
      '/teachers': { data: { content: [{ id: 't1', firstName: 'Jean', lastName: 'Mba' }] } },
    });
    render(<EnseignementsPage />);

    fireEvent.click(await screen.findByRole('button', { name: /Ajouter un enseignement/ }));
    await waitFor(() => expect(screen.getAllByRole('option', { name: 'Terminale A' }).length).toBeGreaterThan(0));
    fireEvent.change(screen.getByLabelText('Classe'), { target: { value: 'g1' } });
    fireEvent.change(screen.getByLabelText('Matière'), { target: { value: 's1' } });
    fireEvent.change(screen.getByLabelText('Enseignant'), { target: { value: 't1' } });
    fireEvent.change(screen.getByLabelText('Volume prévu (heures)'), { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    await waitFor(() => expect(fetchWithAuth).toHaveBeenCalledWith('/courses', expect.objectContaining({ method: 'POST' })));
    const body = JSON.parse((fetchWithAuth as jest.Mock).mock.calls.find(([url, init]) => url === '/courses' && init?.method === 'POST')[1].body);
    expect(body).toEqual({ orgUnitId: 'g1', subjectId: 's1', teacherId: 't1', plannedHours: 60 });
  });
});

describe('Rattrapages', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists cancelled sessions per teacher and opens the planning modal', async () => {
    mockApi({ '/schedule-events/to-make-up': { data: [cancelled] }, '/org-units': [] });

    render(<RattrapagesPage />);

    expect(await screen.findByText('Philosophie — Terminale A')).toBeInTheDocument();
    expect(screen.getByText('Jean Mba')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Planifier le rattrapage/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Rattrapage de Philosophie');
  });

  it('shows an empty state when nothing is to be made up', async () => {
    mockApi({ '/schedule-events/to-make-up': { data: [] }, '/org-units': [] });

    render(<RattrapagesPage />);

    expect(await screen.findByText('Aucune séance à rattraper.')).toBeInTheDocument();
  });
});
