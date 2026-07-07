import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { useElectionStore } from '../store/electionStore';
import { useAuthStore } from '../store/authStore';

export const useElectionSync = () => {
  const { user } = useAuthStore();
  const { 
    selectedElectionId, 
    selectedElectionName, 
    selectedElectionStatus, 
    setSelectedElection,
    clearSelection
  } = useElectionStore();

  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await axiosInstance.get('/elections/get-elections')).data,
    enabled: user?.role === 'SCHOOL_ADMIN'
  });

  useEffect(() => {
    if (elections && Array.isArray(elections) && user?.role === 'SCHOOL_ADMIN') {
      // Find the current configuring election if none selected
      const configElection = elections.find((e: any) => e.status === 'CONFIGURING');

      if (configElection && !selectedElectionId) {
        setSelectedElection(String(configElection.id), configElection.name, configElection.status);
      } else if (selectedElectionId) {
        // Sync the selected election's name and status if they changed in DB
        const synced = elections.find((e: any) => String(e.id) === selectedElectionId);
        if (synced) {
          if (synced.status !== selectedElectionStatus || synced.name !== selectedElectionName) {
            setSelectedElection(String(synced.id), synced.name, synced.status);
          }
        } else {
          // Selected election was deleted or is no longer available
          clearSelection();
        }
      }
    }
  }, [elections, selectedElectionId, selectedElectionName, selectedElectionStatus, setSelectedElection, clearSelection, user?.role]);

  return { elections };
};
