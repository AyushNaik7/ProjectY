/*
API Route Audit Status (Phase 0)

Legend:
- fixed: runtime/auth/schema bugs were patched in this pass
- reviewed: route logic audited and kept as-is
- follow-up: audited but needs deeper product-level refinement (not blocking build)

1. fixed      /api/campaigns
2. fixed      /api/creators-for-campaign
3. fixed      /api/matched-campaigns
4. fixed      /api/marketplace-campaigns
5. fixed      /api/requests
6. fixed      /api/onboarding/creator
7. fixed      /api/onboarding/brand
8. fixed      /api/initialize-user
9. fixed      /api/creators/search
10. fixed     /api/profile-views
11. fixed     /api/conversations
12. fixed     /api/conversations/[id]/messages
13. reviewed  /api/conversations/[id]/read
14. fixed     /api/deliverables
15. reviewed  /api/deliverables/[id]/approve
16. fixed     /api/deliverables/[id]/revision
17. reviewed  /api/calendar
18. fixed     /api/milestones
19. reviewed  /api/milestones/[id]/complete
20. fixed     /api/reviews
21. fixed     /api/portfolio
22. fixed     /api/portfolio/items
23. fixed     /api/portfolio/items/[id]
24. reviewed  /api/creators/[id]/portfolio
25. reviewed  /api/notifications
26. reviewed  /api/notifications/[id]/read
27. reviewed  /api/search
28. fixed     /api/user/update-role
29. fixed     /api/user/update-metadata
30. reviewed  /api/ai/generate-brief
31. reviewed  /api/generate-embeddings
32. reviewed  /api/embeddings/generate
33. reviewed  /api/embeddings/webhook
34. fixed     /api/webhooks/clerk
35. reviewed  /api/og/creator

Campaigns NOT NULL audit summary:
- campaigns required columns from migrations: brand_id, title, description, deliverable_type, budget, timeline
- bug found: brand_id was being set from Clerk user id in API and frontend paths
- fix applied: API now resolves brand UUID via brands.clerk_user_id before insert
*/

export const apiAuditCompleted = true;
