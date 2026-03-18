import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ElectionState {
  selectedElectionId: string | null;
  selectedElectionName: string | null;
  setSelectedElection: (id: string | null, name: string | null) => void;
  clearSelection: () => void;
}

export const useElectionStore = create<ElectionState>()(
  persist(
    (set) => ({
      selectedElectionId: null,
      selectedElectionName: null,
      setSelectedElection: (id, name) => set({ selectedElectionId: id, selectedElectionName: name }),
      clearSelection: () => set({ selectedElectionId: null, selectedElectionName: null }),
    }),
    {
      name: 'election-storage',
    }
  )
);
