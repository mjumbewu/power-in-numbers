import { db, auth } from '../firebase';
import { doc, setDoc, addDoc, collection, writeBatch } from 'firebase/firestore';
import { demoFinancialProfiles, demoProjects, demoScenarios, demoCollaborators } from './demoData';
import { useCollaboratorsStore } from '../stores/collaborators';

export async function seedDemoData() {
    const user = auth.currentUser;
    if (!user) throw new Error("Must be logged in to seed data");

    const batch = writeBatch(db);

    // 1. Seed User Profile (Financial Data)
    // Map old demo profile to new format
    const demoProfile = demoFinancialProfiles[0];
    const totalMonthlyExpenses = demoProfile.expenses.reduce((sum, item) => sum + item.amount, 0);
    const annualExpenses = totalMonthlyExpenses * 12;

    const financialData = {
        targetHoursPerDay: demoProfile.targetHoursPerDay || 7,
        targetDaysPerWeek: demoProfile.targetDaysPerWeek || 5,
        targetWeeksPerYear: demoProfile.targetWeeksPerYear || 43,
        nonBillablePercentage: demoProfile.nonBillablePercentage || 20,
        annualExpenses: annualExpenses,
        actualCurrentAnnualNetIncome: demoProfile.actualCurrentAnnualNetIncome || 45000
    };

    const userRef = doc(db, 'users', user.uid);
    // We use setDoc with merge to update profile without wiping other potential fields
    batch.set(userRef, { financialData, displayName: user.displayName, email: user.email }, { merge: true });

    // 2. Seed Project
    // We'll create "Echoes of Movement"
    const demoProject = demoProjects[0];

    // Prepare Scenarios Map
    const scenariosMap = {};
    demoScenarios.forEach(s => {
        // Ensure ID is unique-ish or just use demo ID
        scenariosMap[s.id] = {
            ...s,
            id: s.id,
            projectId: 'demo-project-1' // temporary, will be replaced by actual doc ID if we want, but nested map doesn't need projectId field really
        };
    });

    // Prepare Members
    // We add current user as owner
    const members = {
        [user.uid]: { role: 'Owner' }
    };

    // Try to add demo collaborators
    // We will try to write them to 'users' collection.
    // If security rules fail, this part of batch might fail?
    // Actually, batch is atomic. If one fails, all fail.
    // So we should probably do collaborators separately or just try to inject them into store cache.
    // Let's try to write them to DB first. If we are in test mode/dev mode, rules might be open.

    const fakeCollabIds = [];
    demoCollaborators.forEach(c => {
        // We use their demo IDs as doc IDs
        const collabRef = doc(db, 'users', c.id);
        batch.set(collabRef, {
            displayName: c.name,
            email: c.email,
            role: c.role, // This might not be standard user field but useful for display
            financialData: { // Give them some dummy financial data so calculations work
                goalHourly: 100 // Simplified
            }
        }, { merge: true });

        members[c.id] = { role: c.role };
        fakeCollabIds.push(c.id);
    });

    // Construct Project Document
    const newProjectRef = doc(collection(db, 'projects'));
    const projectData = {
        name: demoProject.name,
        description: demoProject.description,
        status: demoProject.status,
        startDate: demoProject.startDate,
        endDate: demoProject.endDate,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scenarios: scenariosMap,
        incomeSources: demoProject.incomeSources,
        phases: demoProject.phases,
        members: members
    };

    batch.set(newProjectRef, projectData);

    try {
        await batch.commit();
        console.log("Demo data seeded successfully!");

        // Also update collaborators store cache immediately so UI reflects it
        const collabStore = useCollaboratorsStore();
        demoCollaborators.forEach(c => {
            collabStore.collaborators[c.id] = {
                id: c.id,
                displayName: c.name,
                email: c.email,
                ...c
            };
        });

        return true;
    } catch (error) {
        console.error("Error seeding demo data:", error);
        // Fallback: If batch failed (likely due to permission on other users),
        // try seeding ONLY the current user's data and project (without fake members)
        if (error.code === 'permission-denied') {
            console.warn("Permission denied for seeding collaborators. Retrying with only user data.");
            await seedUserDataOnly(user, financialData, demoProject, scenariosMap);
            return true;
        }
        throw error;
    }
}

async function seedUserDataOnly(user, financialData, demoProject, scenariosMap) {
    const batch = writeBatch(db);

    // User Profile
    const userRef = doc(db, 'users', user.uid);
    batch.set(userRef, { financialData }, { merge: true });

    // Project (only current user as member)
    const newProjectRef = doc(collection(db, 'projects'));
    const projectData = {
        name: demoProject.name,
        description: demoProject.description,
        status: demoProject.status,
        startDate: demoProject.startDate,
        endDate: demoProject.endDate,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scenarios: scenariosMap,
        incomeSources: demoProject.incomeSources,
        phases: demoProject.phases,
        members: {
            [user.uid]: { role: 'Owner' }
        }
    };
    batch.set(newProjectRef, projectData);

    await batch.commit();
}
