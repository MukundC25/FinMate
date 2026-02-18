import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Family, 
  FamilyMember, 
  FamilyWithMembers,
  FamilyAnalytics 
} from '../types/family.types';
import { Transaction } from '../../../types';
import { FamilyService } from '../services/familyService';

interface FamilyState {
  currentFamily: FamilyWithMembers | null;
  sharedTransactions: Transaction[];
  familyAnalytics: FamilyAnalytics | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadFamily: (userId: string) => Promise<void>;
  createFamily: (name: string, userId: string) => Promise<Family>;
  joinFamily: (inviteCode: string, userId: string) => Promise<void>;
  leaveFamily: (userId: string) => Promise<void>;
  shareTransaction: (transactionId: string, userId: string) => Promise<void>;
  unshareTransaction: (transactionId: string) => Promise<void>;
  loadSharedTransactions: () => Promise<void>;
  loadFamilyAnalytics: (startDate?: string, endDate?: string) => Promise<void>;
  removeMember: (userId: string, requestingUserId: string) => Promise<void>;
  deleteFamily: (userId: string) => Promise<void>;
  refreshFamily: () => Promise<void>;
  clearFamily: () => void;
  setError: (error: string | null) => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      currentFamily: null,
      sharedTransactions: [],
      familyAnalytics: null,
      isLoading: false,
      error: null,

      loadFamily: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          const family = await FamilyService.getFamilyByUserId(userId);
          set({ currentFamily: family, isLoading: false });
          
          if (family) {
            await get().loadSharedTransactions();
          }
        } catch (error) {
          console.error('Error loading family:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load family',
            isLoading: false 
          });
        }
      },

      createFamily: async (name: string, userId: string) => {
        try {
          set({ isLoading: true, error: null });
          const family = await FamilyService.createFamily({ name, createdByUserId: userId });
          await get().loadFamily(userId);
          set({ isLoading: false });
          return family;
        } catch (error) {
          console.error('Error creating family:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create family',
            isLoading: false 
          });
          throw error;
        }
      },

      joinFamily: async (inviteCode: string, userId: string) => {
        try {
          set({ isLoading: true, error: null });
          await FamilyService.joinFamily({ inviteCode, userId });
          await get().loadFamily(userId);
          set({ isLoading: false });
        } catch (error) {
          console.error('Error joining family:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to join family',
            isLoading: false 
          });
          throw error;
        }
      },

      leaveFamily: async (userId: string) => {
        try {
          const { currentFamily } = get();
          if (!currentFamily) {
            throw new Error('No family to leave');
          }

          set({ isLoading: true, error: null });
          await FamilyService.leaveFamily(currentFamily.id, userId);
          set({ currentFamily: null, sharedTransactions: [], isLoading: false });
        } catch (error) {
          console.error('Error leaving family:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to leave family',
            isLoading: false 
          });
          throw error;
        }
      },

      shareTransaction: async (transactionId: string, userId: string) => {
        try {
          const { currentFamily } = get();
          if (!currentFamily) {
            throw new Error('No family to share with');
          }

          set({ isLoading: true, error: null });
          await FamilyService.shareTransaction({
            transactionId,
            familyId: currentFamily.id,
            sharedByUserId: userId,
          });
          await get().loadSharedTransactions();
          set({ isLoading: false });
        } catch (error) {
          console.error('Error sharing transaction:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to share transaction',
            isLoading: false 
          });
          throw error;
        }
      },

      unshareTransaction: async (transactionId: string) => {
        try {
          const { currentFamily } = get();
          if (!currentFamily) {
            throw new Error('No family found');
          }

          set({ isLoading: true, error: null });
          await FamilyService.unshareTransaction(transactionId, currentFamily.id);
          await get().loadSharedTransactions();
          set({ isLoading: false });
        } catch (error) {
          console.error('Error unsharing transaction:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to unshare transaction',
            isLoading: false 
          });
          throw error;
        }
      },

      loadSharedTransactions: async () => {
        try {
          const { currentFamily } = get();
          if (!currentFamily) {
            set({ sharedTransactions: [] });
            return;
          }

          const transactions = await FamilyService.getSharedTransactions(currentFamily.id);
          set({ sharedTransactions: transactions });
        } catch (error) {
          console.error('Error loading shared transactions:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load shared transactions'
          });
        }
      },

      loadFamilyAnalytics: async (startDate?: string, endDate?: string) => {
        try {
          const { currentFamily } = get();
          if (!currentFamily) {
            set({ familyAnalytics: null });
            return;
          }

          set({ isLoading: true, error: null });
          const analytics = await FamilyService.getFamilyAnalytics(
            currentFamily.id,
            startDate,
            endDate
          );
          set({ familyAnalytics: analytics, isLoading: false });
        } catch (error) {
          console.error('Error loading family analytics:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load analytics',
            isLoading: false 
          });
        }
      },

      removeMember: async (userId: string, requestingUserId: string) => {
        try {
          const { currentFamily } = get();
          if (!currentFamily) {
            throw new Error('No family found');
          }

          set({ isLoading: true, error: null });
          await FamilyService.removeMember(currentFamily.id, userId, requestingUserId);
          await get().refreshFamily();
          set({ isLoading: false });
        } catch (error) {
          console.error('Error removing member:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to remove member',
            isLoading: false 
          });
          throw error;
        }
      },

      deleteFamily: async (userId: string) => {
        try {
          const { currentFamily } = get();
          if (!currentFamily) {
            throw new Error('No family to delete');
          }

          set({ isLoading: true, error: null });
          await FamilyService.deleteFamily(currentFamily.id, userId);
          set({ currentFamily: null, sharedTransactions: [], isLoading: false });
        } catch (error) {
          console.error('Error deleting family:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete family',
            isLoading: false 
          });
          throw error;
        }
      },

      refreshFamily: async () => {
        const { currentFamily } = get();
        if (currentFamily) {
          const members = currentFamily.members;
          if (members.length > 0) {
            await get().loadFamily(members[0].userId);
          }
        }
      },

      clearFamily: () => {
        set({ 
          currentFamily: null, 
          sharedTransactions: [], 
          familyAnalytics: null,
          error: null 
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'family-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentFamily: state.currentFamily,
      }),
    }
  )
);
