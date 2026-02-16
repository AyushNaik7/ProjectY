// Quick script to fix user role in Firestore
// Run this with: node fix-user-role.js YOUR_EMAIL_HERE

const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixUserRole(email) {
    try {
        // Get user by email
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        console.log(`Found user: ${email}`);
        console.log(`UID: ${uid}`);

        // Check current user document
        const userDoc = await db.doc(`users/${uid}`).get();

        if (userDoc.exists) {
            console.log('Current user data:', userDoc.data());

            // Update role to creator
            await db.doc(`users/${uid}`).update({
                role: 'creator',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Successfully updated role to "creator"');
        } else {
            // Create user document if it doesn't exist
            await db.doc(`users/${uid}`).set({
                uid,
                email,
                role: 'creator',
                onboardingComplete: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Created new user document with role "creator"');
        }

        // Verify the change
        const updatedDoc = await db.doc(`users/${uid}`).get();
        console.log('Updated user data:', updatedDoc.data());

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    process.exit(0);
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.error('Usage: node fix-user-role.js YOUR_EMAIL_HERE');
    process.exit(1);
}

fixUserRole(email);
