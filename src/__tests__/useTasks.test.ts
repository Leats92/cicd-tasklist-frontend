import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTasks } from '../hooks/useTasks'
import * as taskApi from '../api/taskApi'

vi.mock('../api/taskApi')

const mockTasks = [
  { id: 1, title: 'Tâche 1', description: null,   completed: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 2, title: 'Tâche 2', description: 'Desc', completed: true,  createdAt: '2024-01-01', updatedAt: '2024-01-01' },
]

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(taskApi.getTasks).mockResolvedValue(mockTasks)
  })

  it('charge les tâches automatiquement au montage', async () => {
    const { result } = renderHook(() => useTasks())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(taskApi.getTasks).toHaveBeenCalledOnce()
    expect(result.current.tasks).toHaveLength(2)
  })

  it('retourne un état de chargement pendant la requête', () => {
    vi.mocked(taskApi.getTasks).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockTasks), 500))
    )

    const { result } = renderHook(() => useTasks())

    expect(result.current.loading).toBe(true)
  })

  it('ajoute une tâche via addTask', async () => {
    const newTask = { id: 3, title: 'Nouvelle tâche', description: null, completed: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
    vi.mocked(taskApi.createTask).mockResolvedValue(newTask)

    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addTask({ title: 'Nouvelle tâche' })
    })

    expect(taskApi.createTask).toHaveBeenCalledWith({ title: 'Nouvelle tâche' })
  })

  it('supprime une tâche via removeTask', async () => {
    vi.mocked(taskApi.deleteTask).mockResolvedValue(undefined)

    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.removeTask(1)
    })

    expect(taskApi.deleteTask).toHaveBeenCalledWith(1)
  })

  it('bascule le statut completed via toggleComplete', async () => {
    vi.mocked(taskApi.updateTask).mockResolvedValue({ ...mockTasks[0], completed: true })

    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.toggleComplete(1)
    })

    expect(taskApi.updateTask).toHaveBeenCalledWith(1, { completed: true })
  })

  it('met à jour une tâche via editTask', async () => {
    const updated = { ...mockTasks[0], title: 'Titre modifié' }
    vi.mocked(taskApi.updateTask).mockResolvedValue(updated)

    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.editTask(1, { title: 'Titre modifié' })
    })

    expect(taskApi.updateTask).toHaveBeenCalledWith(1, { title: 'Titre modifié' })
  })

  it('expose une erreur si le chargement échoue', async () => {
    vi.mocked(taskApi.getTasks).mockRejectedValue(new Error('Erreur réseau'))

    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).not.toBeNull()
  })
})
