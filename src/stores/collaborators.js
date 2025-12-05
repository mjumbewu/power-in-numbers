import { defineStore } from 'pinia';
import { db } from '../firebase';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';

export const useCollaboratorsStore = defineStore('collaborators', {
    state: () => ({
        collaborators: {}, // Cache of user profiles keyed by UID
        loading: false,
        error: null
    }),

    getters: {
        getById: (state) => (id) => {
            return state.collaborators[id];
        }
    },

    actions: {
        async findUserByEmail(email) {
            this.loading = true;
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('email', '==', email));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    return null;
                }

                const doc = querySnapshot.docs[0];
                const user = { id: doc.id, ...doc.data() };

                // Cache it
                this.collaborators[user.id] = user;

                this.loading = false;
                return user;
            } catch (error) {
                this.error = error.message;
                this.loading = false;
                throw error;
            }
        },

        async fetchUsersByIds(uids) {
            if (!uids || uids.length === 0) return;

            // Filter out ones we already have cached?
            // For now, let's just fetch to be safe and get latest data.

            this.loading = true;
            try {
                // Firestore 'in' query is limited to 10 items.
                // For MVP, we'll just do individual fetches or batches if needed.
                // Let's do a simple loop for now as it's robust.

                const usersRef = collection(db, 'users');
                // Optimization: Use 'in' query for chunks of 10

                const uniqueIds = [...new Set(uids)];
                const chunks = [];
                for (let i = 0; i < uniqueIds.length; i += 10) {
                    chunks.push(uniqueIds.slice(i, i + 10));
                }

                for (const chunk of chunks) {
                    const q = query(usersRef, where(documentId(), 'in', chunk));
                    const querySnapshot = await getDocs(q);

                    querySnapshot.forEach((doc) => {
                        this.collaborators[doc.id] = { id: doc.id, ...doc.data() };
                    });
                }

                this.loading = false;
            } catch (error) {
                this.error = error.message;
                this.loading = false;
            }
        }
    }
});
