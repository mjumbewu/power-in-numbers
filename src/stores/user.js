import { defineStore } from 'pinia';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { calculatePersonalRates } from '../utils/calculations';

export const useUserStore = defineStore('user', {
    state: () => ({
        profile: null,
        loading: false,
        error: null,
        unsubscribe: null
    }),

    getters: {
        rates: (state) => {
            if (!state.profile || !state.profile.financialData) return null;

            // Adapt the Firestore data structure to what calculatePersonalRates expects
            const profileForCalc = {
                ...state.profile.financialData,
                expenses: state.profile.financialData.expenses || []
            };

            return calculatePersonalRates(profileForCalc);
        }
    },

    actions: {
        async fetchProfile() {
            const user = auth.currentUser;
            if (!user) return;

            this.loading = true;
            try {
                // Set up real-time listener
                if (this.unsubscribe) this.unsubscribe();

                const userRef = doc(db, 'users', user.uid);
                this.unsubscribe = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        this.profile = { id: docSnap.id, ...docSnap.data() };
                    } else {
                        this.error = "User profile not found";
                    }
                    this.loading = false;
                }, (error) => {
                    this.error = error.message;
                    this.loading = false;
                });

            } catch (error) {
                this.error = error.message;
                this.loading = false;
            }
        },

        async updateFinancialData(updates) {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const userRef = doc(db, 'users', user.uid);

                // Use setDoc with merge: true to handle both creation and updates
                // This avoids "No document to update" errors for new users
                await setDoc(userRef, {
                    financialData: updates,
                    email: user.email,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async updateExpenses(expenses) {
            return this.updateFinancialData({ expenses });
        },

        cleanup() {
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
            this.profile = null;
        }
    }
});
