import { mockPets } from '../mock/pets'

// Swap mock functions for real api calls when backend is ready.
// import api from './api'

export const getPets = async () => mockPets
export const getPetById = async (id) => mockPets.find((p) => p.id === id)
export const createPet = async (data) => ({ ...data, id: Date.now() })
export const updatePet = async (id, data) => ({ ...data, id })
export const deletePet = async (id) => ({ success: true, id })
