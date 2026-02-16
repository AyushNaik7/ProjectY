/**
 * API Route: Get Creators for Campaign
 *
 * POST /api/creators-for-campaign
 * Body: { idToken, campaignId }
 *
 * Returns potential creators matched against a specific campaign.
 * NEVER returns minRatePrivate to the frontend.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { computeMatchScore, CreatorData, CampaignData } from "@/lib/server-matching";

export async function POST(req: NextRequest) {
    try {
        const { idToken, campaignId } = await req.json();

        if (!idToken || !campaignId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const decoded = await adminAuth.verifyIdToken(idToken);
        const uid = decoded.uid;

        // Verify brand
        const userDoc = await adminDb.doc(`users/${uid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== "brand") {
            return NextResponse.json({ error: "Only brands can view creator matches" }, { status: 403 });
        }

        // Fetch campaign to match against
        const campaignDoc = await adminDb.doc(`campaigns/${campaignId}`).get();
        if (!campaignDoc.exists) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }
        const campaign = campaignDoc.data() as CampaignData & { brandId: string };

        // Ensure brand owns the campaign
        if (campaign.brandId !== uid) {
            return NextResponse.json({ error: "Unauthorized access to campaign" }, { status: 403 });
        }

        // Fetch verified creators (limit 50 for MVP)
        // In production, use filters or specialized index
        const creatorsSnap = await adminDb
            .collection("creators")
            // .where("verified", "==", true) // Optional: restrict to verified
            .limit(100)
            .get();

        const matchedCreators = creatorsSnap.docs.map((doc) => {
            const creator = doc.data() as CreatorData & {
                uid: string,
                name: string,
                instagramHandle: string
            };

            const match = computeMatchScore(creator, campaign);

            // Return SANITIZED creator object
            // minRatePrivate is intentionally EXCLUDED
            return {
                uid: creator.uid,
                name: creator.name,
                instagramHandle: creator.instagramHandle,
                niche: creator.niche,
                followers: creator.followers,
                avgViews: creator.avgViews,
                engagementRate: creator.engagementRate,
                verified: creator.verified,
                matchScore: match.score,
                matchReasons: match.reasons,
            };
        });

        // Filter low scores (e.g. < 20) and sort by best match
        const results = matchedCreators
            .filter(c => c.matchScore >= 20)
            .sort((a, b) => b.matchScore - a.matchScore);

        return NextResponse.json({ creators: results });

    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Error fetching matched creators:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
