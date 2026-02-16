/**
 * API Route: Get Matched Campaigns for Creator
 *
 * POST /api/matched-campaigns
 * Body: { idToken }
 *
 * Returns campaigns scored against creator profile.
 * minRatePrivate is used for scoring but NEVER returned to the frontend.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { computeMatchScore, CreatorData, CampaignData } from "@/lib/server-matching";

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const decoded = await adminAuth.verifyIdToken(idToken);
        const uid = decoded.uid;

        // Verify creator
        const userDoc = await adminDb.doc(`users/${uid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== "creator") {
            return NextResponse.json({ error: "Only creators can view matches" }, { status: 403 });
        }

        const creatorDoc = await adminDb.doc(`creators/${uid}`).get();
        if (!creatorDoc.exists) {
            return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
        }

        const creator = creatorDoc.data() as CreatorData;

        // Fetch active campaigns
        const campaignsSnap = await adminDb
            .collection("campaigns")
            .where("status", "==", "active")
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        const matchedCampaigns = campaignsSnap.docs.map((doc) => {
            // Cast to a type that includes both matching fields and display fields
            const campaign = doc.data() as CampaignData & {
                brandId: string;
                title: string;
                description: string;
                deliverableType: string;
                timeline: string;
                status: string;
            };

            const match = computeMatchScore(creator, campaign);

            return {
                id: doc.id,
                brandId: campaign.brandId,
                title: campaign.title,
                description: campaign.description,
                deliverableType: campaign.deliverableType,
                budget: campaign.budget,
                timeline: campaign.timeline,
                niche: campaign.niche,
                status: campaign.status,
                matchScore: match.score,
                matchReasons: match.reasons,
            };
        });

        // Sort by match score, best first
        matchedCampaigns.sort((a, b) => b.matchScore - a.matchScore);

        return NextResponse.json({ campaigns: matchedCampaigns });
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Error fetching matched campaigns:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
