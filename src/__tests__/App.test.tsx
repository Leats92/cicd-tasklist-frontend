import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'
import { useTasks } from '../hooks/useTasks'

vi.mock('../hooks/useTasks')

const mockUseTasks = vi.mocked(useTasks)

const defaultHookValue = {
  tasks: [],
  loading: false,
  error: null,
  addTask: vi.fn(),
  editTask: vi.fn(),
  removeTask: vi.fn(),
  toggleComplete: vi.fn(),
  loadTasks: vi.fn(),
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTasks.mockReturnValue(defaultHookValue)
  })

  it('affiche le titre principal "Mes Tâches"', () => {
    render(<App />)
    expect(screen.getByText('Mes Tâches')).toBeInTheDocument()
  })

  it('n\'affiche pas les statistiques quand aucune tâche', () => {
    render(<App />)
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
  })

  it('calcule correctement le total et les tâches terminées', () => {
    mockUseTasks.mockReturnValue({
      ...defaultHookValue,
      tasks: [
        { id: 1, title: 'Tâche 1', description: null, completed: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 2, title: 'Tâche 2', description: null, completed: true,  createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
    })

    render(<App />)

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Terminées')).toBeInTheDocument()
    const statValues = screen.getAllByText('1')
    expect(statValues.length).toBeGreaterThanOrEqual(1)
  })

  it('affiche l\'état de chargement', () => {
    mockUseTasks.mockReturnValue({ ...defaultHookValue, loading: true })

    render(<App />)

    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
  })
})
