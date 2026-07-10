# The Exchange — Franchise Transfer Logic & Platform Governance Rules

---

## PART 1: INDIVIDUAL TEAM SALES

### Sale Completion Flow

When a franchise sale is completed (Buy Now or Accepted Offer), the following atomic transaction occurs:

### 1. Ownership Transfer (Instant — MongoDB Atomic Transaction)
```
transaction {
  // 1. Verify buyer SP balance (earnedSamPoints — transferable SP)
  // 2. Debit buyer's earnedSamPoints
  // 3. Credit seller's earnedSamPoints
  // 4. Set team.user = buyerId
  // 5. Push seller to team.previousOwners array
  // 6. Reset AI autopilot (aiAutopilot = false)
  // 7. Terminate all AI Coach subscriptions (CoachSubscription → cancelled)
  // 8. Update listing status to "sold"
  // 9. Auto-reject all other pending offers on this listing
  // 10. Create ExchangeTransaction record (immutable audit trail)
  // 11. Commit or abort (all-or-nothing)
}
```

### 2. What STAYS with the team (never changes on sale)
- League and division placement
- Current season record, position, standings
- Full roster (all players, contracts, stats)
- Stadium and facilities
- Season history and trophy cabinet
- Scheduled fixtures
- Team name, branding, colors
- Financial structure (salary cap, existing contracts)
- Works with ANY league size (8, 16, 20, 32, etc.)

### 3. What CHANGES on sale
- `team.user` → new buyer
- `team.previousOwners` → seller added to history
- `team.aiAutopilot` → reset to false
- Listing → status set to "sold", removed from Exchange
- All pending offers on this team → auto-rejected
- AI Coach subscriptions → immediately cancelled
- DM threads related to this listing → archived

### 4. Seller Lockout (Immediate, 100%)
After sale completes:
- Team removed from seller's ownership
- Seller's War Room / My Empire no longer shows the team
- Seller's Trophy Room no longer includes that team's trophies
- All API endpoints return 403 Forbidden for seller + team combination
- Seller cannot view roster, financials, schedule, or any team data
- Seller's KPI aggregations recalculate without this team

### 5. AI Coach Termination (Immediate)
- All AI Coach subscriptions for this team under the seller's account → status "cancelled"
- The team reverts to no AI coach mode
- The buyer must assign their own AI coach
- AI coach is owner-bound, NOT team-bound
- Any AI coach subscription fees stop billing the seller immediately
- In-progress AI decisions (pending trades, lineup changes) are cancelled

### 6. Ownership Lock (Anti-Flip Protection)
- 120-day lock (~1 season) applied to buyer on acquisition
- Buyer cannot re-list the team until lock expires
- UI shows "🔒 Complete 1 season to list on Exchange" badge
- API rejects listing attempts where ownershipLockUntil > current date
- Prevents rapid franchise flipping, promotes committed ownership

---

## PART 2: EMPIRE SALES (Full Portfolio Liquidation)

### Empire Sale Modes

Sellers have TWO options when selling their entire empire:

**BUNDLE MODE:**
- All teams listed as a single package
- One buyer acquires the entire empire
- Seller sets ANY price they want (no percentage cap)
- Buyers can Buy Now or Make Offer on the whole bundle
- All teams transfer in one atomic transaction (same as individual but looped)
- Per-team price calculated proportionally based on market value
- Each team gets its own ExchangeTransaction record

**INDIVIDUAL MODE:**
- A "Sell All" action that creates separate ExchangeListing entries for each team
- Each team appears independently on the Exchange
- Multiple buyers can pick and choose
- Default price = market value (seller can adjust later)
- Teams sell independently through normal Exchange flow

### Empire Sale Rules
- Locked teams (under 120-day lock) are excluded from empire sales
- Only one active empire sale per seller at a time
- Empire sale expires after 30 days
- Seller can delist the empire sale at any time (all associated listings also delist)
- Bundle mode supports Buy Now + Make Offer
- Individual mode teams follow all standard Exchange rules

### Dormant Account (Post-Empire Sale)
When ALL of a seller's teams have been sold:
- Account set to `isActive: false`, `accountStatus: "dormant"`
- Limited platform access until a new team is acquired
- SP balance is KEPT — seller retains all funds
- Seller can reactivate by purchasing a team on the Exchange
- Reactivation restores full account access (`isActive: true`, `accountStatus: "approve"`)

---

## PART 3: API ENDPOINTS

### Individual Team Exchange
```
GET    /exchange/listings                   — Browse active listings (sport filter, sort, pagination)
GET    /exchange/listings/:id               — Single listing detail (increments views)
POST   /exchange/list                       — Put franchise On the Block
DELETE /exchange/delist/:listingId           — Remove from Exchange
GET    /exchange/my-listings                — Seller's own listings
POST   /exchange/offer                      — Make an offer
GET    /exchange/my-offers                  — Buyer's sent offers
GET    /exchange/received-offers            — Seller's received offers
POST   /exchange/offer/:offerId/accept      — Accept offer → triggers transfer
POST   /exchange/offer/:offerId/reject      — Reject offer
POST   /exchange/offer/:offerId/withdraw    — Buyer withdraws offer
POST   /exchange/buy-now                    — Acquire at asking price
GET    /exchange/stats                      — Exchange KPI data
GET    /exchange/dm                         — All DM conversations
POST   /exchange/dm/send                    — Send a DM
POST   /exchange/dm/:conversationId/read    — Mark conversation read
GET    /exchange/history                    — Buy/sell transaction history
```

### Empire Sale
```
GET    /exchange/empire/my-teams            — Get seller's teams for empire sale setup
POST   /exchange/empire/create              — List empire (bundle or individual mode)
GET    /exchange/empire/listings             — Browse empire bundle listings
GET    /exchange/empire/my-sale             — Seller's active empire sale
GET    /exchange/empire/:id                 — Single empire sale detail
POST   /exchange/empire/buy-bundle          — Acquire entire empire at asking price
POST   /exchange/empire/offer               — Make offer on empire bundle
POST   /exchange/empire/offer/:offerId/accept — Accept empire offer
DELETE /exchange/empire/delist/:empireSaleId — Delist empire sale
POST   /exchange/empire/reactivate          — Reactivate dormant account
```

---

## PART 4: COMMISSIONER GOVERNANCE

### Core Rules
1. **Commissioner CANNOT stop a league unilaterally** — pausing requires 66% league vote
2. **Commissioner CAN transfer rights** to another player in the league at any time
3. **Players CAN initiate a Vote of No Confidence** against the commissioner
4. **No Confidence passes at 50% + 1** of total league members (not just voters)
5. **On successful no-confidence:** AI Commissioner takes over with FULL powers
6. **New commissioner elected:** Volunteers nominate themselves, league votes
7. **Old commissioner loses ALL rights** once new commissioner is appointed

### Vote of No Confidence Flow
```
1. Any league member (non-commissioner) initiates the vote
   → POST /governance/:leagueId/no-confidence
   → Initiator's vote auto-cast as "yes"
   → 72-hour voting window opens

2. All league members vote (yes / no / abstain)
   → POST /governance/vote/:voteId/cast
   → Real-time updates via Socket.io

3. Threshold check: 50% + 1 of TOTAL eligible members
   → If 10 members: need 6 yes votes
   → Early pass: motion passes as soon as threshold reached
   → Early fail: motion fails if mathematically impossible to pass

4. If PASSES:
   → Old commissioner removed from league.mainCommissioner
   → AI Commissioner activates with FULL POWERS
   → 48-hour nomination phase opens for new commissioner

5. If FAILS:
   → Commissioner stays, vote recorded in history
```

### Commissioner Election Flow
```
1. NOMINATION PHASE (48 hours)
   → Members volunteer as candidates
   → POST /governance/election/:electionId/nominate
   → Candidates submit a statement (max 500 chars)
   → Removed commissioner CANNOT run

2. TRANSITION
   → If 0 candidates: AI Commissioner stays in charge
   → If 1 candidate: auto-appointed as new commissioner
   → If 2+ candidates: election voting opens

3. ELECTION VOTING (48 hours)
   → POST /governance/election/:electionId/vote
   → Each member votes for one candidate
   → Simple majority wins

4. WINNER APPOINTED
   → league.mainCommissioner = winner
   → AI Commissioner deactivated
   → Old commissioner's rights permanently revoked for this league
```

### Commissioner Transfer
```
→ Commissioner voluntarily transfers rights to another league member
→ POST /governance/:leagueId/transfer-commissioner
→ Immediate — no vote required
→ Old commissioner loses all commissioner rights
→ New commissioner gains full control
```

### League Pause (66% Required)
```
→ Commissioner proposes a pause
→ POST /governance/:leagueId/propose-pause
→ 72-hour voting window
→ Requires 66% of total league members voting "yes"
→ League goes dormant (renewalStatus = "cancelled")
→ League is NEVER deleted — only paused
→ League can be reactivated later
```

### AI Commissioner Powers (Full — Same as Human)
While AI Commissioner is in charge:
- Schedules and fixtures continue automatically
- Rule enforcement stays active
- Trade reviews and approvals continue
- Dispute resolution handled by AI
- League settings remain unchanged (AI doesn't modify rules)
- Draft management continues
- Season renewal handled
- ALL commissioner functions operate normally

### Governance API Endpoints
```
POST   /governance/:leagueId/no-confidence              — Start no-confidence vote
POST   /governance/vote/:voteId/cast                     — Cast vote (yes/no/abstain)
POST   /governance/election/:electionId/nominate         — Volunteer as candidate
POST   /governance/election/:electionId/vote             — Vote for a candidate
POST   /governance/election/:electionId/start-voting     — Transition to voting phase
POST   /governance/:leagueId/transfer-commissioner       — Voluntary transfer
POST   /governance/:leagueId/propose-pause               — Propose league pause
GET    /governance/:leagueId/active-votes                — Active governance votes
GET    /governance/:leagueId/history                     — Governance vote history
GET    /governance/:leagueId/commissioner-info           — Commissioner + AI status
```

---

## PART 5: VALIDATION RULES

### Exchange Validations
- Buyer must have sufficient earnedSamPoints (transferable SP) balance
- Seller must own the team (`team.user === seller._id`)
- Team must not be under ownership lock (120-day cooldown)
- Asking price must be within 50%-200% of market valuation (individual listings)
- Empire bundle price: seller sets freely (no cap)
- Offer amount must be > 0
- Cannot buy your own team / empire
- Cannot make an offer on your own listing
- One active offer per buyer per listing
- One active listing per team
- One active empire sale per seller

### Governance Validations
- League must have 3+ members for no-confidence votes
- League must have 2+ members for pause votes
- Commissioner cannot initiate no-confidence against themselves
- Only one active no-confidence process per league at a time
- Removed commissioner cannot run in the follow-up election
- Must be a league member to vote or nominate
- Cannot vote twice on the same motion
- Voting windows enforced (72 hours for votes, 48 hours for nominations/elections)
