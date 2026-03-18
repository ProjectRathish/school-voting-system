import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ElectionState {
  selectedElectionId: string | null;
  selectedElectionName: string | null;
  selectedElectionStatus: string | null;
  setSelectedElection: (id: string | null, name: string | null, status: string | null) => void;
  clearSelection: () => void;
}

export const useElectionStore = create<ElectionState>()(
  persist(
    (set) => ({
      selectedElectionId: null,
      selectedElectionName: null,
      selectedElectionStatus: null,
      setSelectedElection: (id, name, status) => set({ selectedElectionId: id, selectedElectionName: name, selectedElectionStatus: status }),
      clearSelection: () => set({ selectedElectionId: null, selectedElectionName: null, selectedElectionStatus: null }),
    }),
    {
      name: 'election-storage',
    }
  )
);
