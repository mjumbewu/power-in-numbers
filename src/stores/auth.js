import { defineStore } from 'pinia';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        authInitialized: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
        currentUserId: (state) => state.user?.uid
    },

    actions: {
        initAuth() {
            return new Promise((resolve) => {
                onAuthStateChanged(auth, (user) => {
                    this.user = user;
                    this.authInitialized = true;
                    resolve(user);
                });
            });
        },

        async register(email, password, displayName) {
            this.error = null;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Update display name
                await updateProfile(user, { displayName });

                // Create user document in Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    displayName: displayName,
                    createdAt: new Date().toISOString(),
                    financialData: {
                        // Default empty financial data
                        annualExpenses: 0,
                        targetHoursPerDay: 7,
                        targetDaysPerWeek: 5,
                        targetWeeksPerYear: 43,
                        nonBillablePercentage: 20
                    }
                });

                this.user = user;
                return user;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async login(email, password) {
            this.error = null;
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                this.user = userCredential.user;
                return this.user;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async logout() {
            try {
                await signOut(auth);
                this.user = null;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        }
    }
});
