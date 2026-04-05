# Requirements Document

## Introduction

This specification addresses three critical bugs in the campaigns and requests system that impact the user experience for both creators and brands. The fixes ensure reliable AI matching, proper UI feedback, and correct approval workflows.

## Glossary

- **System**: The campaigns and requests management platform
- **AI_Matcher**: The vector-based matching service that ranks campaigns for creators
- **Rule_Based_Matcher**: The fallback matching algorithm using business logic scoring
- **Match_Breakdown_Tooltip**: The UI component displaying detailed match score breakdown
- **Request_Verification_Flow**: The two-step approval process for collaboration requests
- **Creator**: A content creator user who applies to campaigns
- **Brand**: A brand user who creates campaigns and verifies requests
- **Marketplace_API**: The API endpoint at /api/marketplace-campaigns
- **Vector_Matching_Service**: The service in src/lib/vector-matching.ts

## Requirements

### Requirement 1: AI Matching Reliability

**User Story:** As a creator, I want to see matched campaigns reliably, so that I can discover relevant collaboration opportunities even when AI services experience issues.

#### Acceptance Criteria

1. WHEN the Vector_Matching_Service fails to return results, THEN the System SHALL fall back to the Rule_Based_Matcher
2. WHEN the Vector_Matching_Service throws an error, THEN the System SHALL log the error with context details
3. WHEN the fallback matching is used, THEN the System SHALL return at least the top 10 rule-based matches
4. WHEN vector matching succeeds, THEN the System SHALL return AI-ranked campaigns with match scores
5. IF the Marketplace_API encounters an error, THEN the System SHALL return a descriptive error message to the client
6. WHEN the AI_Matcher fails silently, THEN the System SHALL detect the empty result and trigger fallback logic

### Requirement 2: Match Breakdown Tooltip Display

**User Story:** As a creator, I want to see the detailed match breakdown when hovering over the match score, so that I understand why a campaign is recommended for me.

#### Acceptance Criteria

1. WHEN a creator hovers over the match score badge on the campaign detail page, THEN the System SHALL display the Match_Breakdown_Tooltip
2. WHEN the Match_Breakdown_Tooltip is displayed, THEN the System SHALL render it above all other UI elements
3. WHEN the tooltip is visible, THEN the System SHALL show audience overlap, niche match, engagement fit, and budget fit percentages
4. WHEN the creator moves the cursor away from the match score badge, THEN the System SHALL hide the Match_Breakdown_Tooltip
5. WHEN the tooltip is rendered, THEN the System SHALL position it relative to the match score badge without overlapping critical UI elements

### Requirement 3: Request Verification Flow

**User Story:** As a brand, I want to verify and approve collaboration requests before creators can accept them, so that I can ensure quality control in my campaign partnerships.

#### Acceptance Criteria

1. WHEN a creator submits a collaboration request, THEN the System SHALL set the request status to "pending"
2. WHEN a request status is "pending", THEN the System SHALL display a "Verify & Approve" button to the brand
3. WHEN a brand clicks "Verify & Approve", THEN the System SHALL update the request status to "brand_approved"
4. WHEN a request status is "pending", THEN the System SHALL NOT display Accept or Reject buttons to the creator
5. WHEN a request status is "brand_approved", THEN the System SHALL display Accept and Reject buttons to the creator
6. WHEN a creator clicks Accept on a "brand_approved" request, THEN the System SHALL update the request status to "accepted"
7. WHEN a creator clicks Reject on a "brand_approved" request, THEN the System SHALL update the request status to "rejected"
8. WHEN a request status is "pending", THEN the System SHALL display "Awaiting Brand Approval" message to the creator
9. WHEN a request status is "brand_approved", THEN the System SHALL display "Approved — Awaiting Creator" message to the brand
10. WHEN updating request status, THEN the System SHALL persist the change to the database immediately

### Requirement 4: Error Handling and Logging

**User Story:** As a developer, I want comprehensive error logging for matching failures, so that I can diagnose and fix issues quickly.

#### Acceptance Criteria

1. WHEN the Vector_Matching_Service fails, THEN the System SHALL log the error with creator ID, timestamp, and error details
2. WHEN falling back to rule-based matching, THEN the System SHALL log a warning with the reason for fallback
3. WHEN the Marketplace_API returns an error, THEN the System SHALL include the request ID in the error response
4. WHEN vector matching returns zero results unexpectedly, THEN the System SHALL log a warning indicating potential data issues
5. WHEN the embedding generation fails, THEN the System SHALL log the error and proceed with fallback matching
