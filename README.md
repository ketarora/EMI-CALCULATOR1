# Tenure — Loan EMI Workspace

A loan EMI calculator where every open browser tab is a window into the
same shared workspace. Change the loan amount in one tab and every other
tab updates instantly — no server, no polling, no `localStorage` event
hacks. Tabs talk to each other directly over the [`BroadcastChannel`
API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API).

Built for the Frontend Intern Assignment — EMI Calculator with Shared
Workspace. Colors, type, and the overall layout follow the brief's own
reference screens (the design-reference pages near the end of the
assignment PDF) — indigo accent, neutral white/near-black surfaces,
amber for interest, blue for principal.

## Live demo / repo

- Repo: <https://github.com/ketarora/EMI-Calculator>
- Live: _fill in immediately after deploying — see "Deploying" below,
  it's two minutes once the repo is pushed_

## Running it locally

Requires Node 18.18+ (Node 20/22 recommended).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>, then open the same URL in a second tab to see
the sync in action — change the amount, rate, tenure, theme, or add a
prepayment in one tab, watch it land in the other.

```bash
npm run build   # production build
npm run start   # serve the production build
npm run test    # tests/sanity-check.ts (reducer + finance math) and
                # tests/live-sync-check.ts (real BroadcastChannel, two
                # simulated tabs, no mocks)
npm run lint    # ESLint
```

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs all three —
build, both test suites, and lint — on every push and pull request, so
the badge of green you'd see on GitHub isn't just a build succeeding,
it's the actual cross-tab sync simulation passing too.

## Deploying

Zero backend, zero environment variables — this deploys as a plain
static/serverless Next.js app on any platform. Vercel is the fastest path
and is built by the same team as Next.js:

1. **Push this repo to GitHub first** (see the next section — you need
   the code on GitHub before Vercel can import it).
2. Go to **[vercel.com/new](https://vercel.com/new)** and sign in with
   your GitHub account.
3. Click **Import** next to your `EMI-Calculator` repository. (If it
   doesn't show up, click "Adjust GitHub App Permissions" and grant
   Vercel access to the repo.)
4. Leave every setting on its default — Vercel auto-detects Next.js,
   there's nothing to configure, no environment variables to add.
5. Click **Deploy**. It takes about a minute.
6. You'll land on a project dashboard with a live URL like
   `emi-calculator-xyz.vercel.app`. That's your "Live" link for the
   submission — paste it into the section above.
7. *(Optional, for a cleaner URL)* In the project's **Settings → Domains**
   tab, you can edit the auto-generated subdomain to something like
   `tenure-emi.vercel.app` — just avoid the word "Groww" per the brief's
   note, which the default name already does.

Netlify and Cloudflare Pages work the same way (import the GitHub repo,
accept the auto-detected Next.js settings, deploy) if you'd rather use
one of those instead.

## Pushing to GitHub

If you're working from a zip rather than already having this as a git
checkout: the project root already contains a `.git` folder with the
commit history intact and `origin` pointed at
`https://github.com/ketarora/EMI-Calculator.git`. From the project root:

```bash
git push -u origin main
```

Git will prompt you to authenticate as the repo's owner — if you haven't
pushed from this machine before, the simplest route is the [GitHub
CLI](https://cli.github.com/): run `gh auth login` once, then the push
above just works. (GitHub no longer accepts your account password over
HTTPS for this — if prompted for one, use a [Personal Access
Token](https://github.com/settings/tokens) instead, or switch the remote
to SSH if you already have a key registered with GitHub.)

## Requirements coverage

A direct checklist against the brief, for anyone reviewing this quickly:

| Requirement | Status | Where |
|---|---|---|
| EMI calculator (amount/rate/tenure, synced slider + input) | ✅ | `components/calculator/InputPanel.tsx`, `SliderField.tsx` |
| Summary outputs (EMI, total interest, total payable, principal:interest bar) | ✅ | `components/calculator/SummaryCards.tsx` |
| Amortization schedule, paginated, break-even highlighted | ✅ | `components/amortization/ScheduleTable.tsx` |
| Table/chart toggle (stacked bar) | ✅ | `components/amortization/{AmortizationSection,ScheduleChart}.tsx` |
| Compare mode, up to 3 scenarios, lowest-cost highlighted | ✅ | `components/comparison/*` |
| What-if sensitivity grid, 7×7, deduped at edges | ✅ | `components/calculator/SensitivityGrid.tsx`, `lib/finance/sensitivity.ts` |
| Prepayment planner, interest saved, tenure reduced | ✅ | `components/prepayment/PrepaymentPlanner.tsx`, `lib/finance/{amortization,prepayment}.ts` |
| Cross-tab sync (all state, no server/polling/localStorage) | ✅ | `context/WorkspaceProvider.tsx`, `hooks/useBroadcastChannel.ts` |
| Tab identity + live tab count | ✅ | `hooks/usePresence.ts`, `components/workspace/TabPresence.tsx` |
| Theme sync across tabs | ✅ | part of `SharedState.ui.theme`, synced like any other field |
| **Bonus:** tab leadership / source of truth | ✅ | `WorkspaceProvider.tsx` (`REQUEST_INIT`/`SYNC_INIT` handshake), `lib/sync/peers.ts` |
| **Bonus:** cross-tab undo | ✅ | `hooks/useUndoShortcut.ts`, `history` field on `SharedState` |
| **Bonus:** CSV export | ✅ | `lib/export/csv.ts` (PapaParse) |
| **Bonus:** URL state sharing | ✅ | `hooks/useUrlState.ts` |

Every math-related row above is also covered by an assertion in
`tests/sanity-check.ts` that checks the actual output against the
brief's own worked examples — not just "it runs," but "it runs and
produces the number the brief says it should."

## Architecture

### The reducer must be pure — this was not a theoretical concern

Early on, `ADD_PREPAYMENT` and `ADD_SCENARIO` generated their new entity's
`id` *inside* the reducer with `crypto.randomUUID()`. That looks harmless
in isolation, and `tests/sanity-check.ts` (which only ever runs the
reducer once per assertion) didn't catch it. It's a real bug under this
architecture specifically: because every tab replays the *same broadcast
action* through its own independent reducer instance, two tabs handed an
identical `{ type: "ADD_PREPAYMENT", payload: { month, amount } }` action
would each mint their *own* random id — so "the same" prepayment would
exist under two different ids on two different tabs, and a later
`REMOVE_PREPAYMENT` from one tab would silently fail to remove it on the
other.

`tests/live-sync-check.ts` exists specifically to catch this class of
bug: it opens two real `BroadcastChannel` instances in the same process
(Node 18+ ships the same API surface browsers do) and asserts that two
independent reducers converge to *byte-identical* state after replaying
the same message stream. It failed on the first run. The fix: every
entity-creating action now carries a fully-formed entity built at the
*dispatch call site* (`lib/scenarios.ts`, `lib/sync/ids.ts`) — the
reducer (`context/workspaceReducer.ts`) never calls `Date.now()`,
`Math.random()`, or `crypto.randomUUID()` itself, by rule. There's also a
cheap, always-on version of the same check in `sanity-check.ts` that
replays an action sequence against two fresh states and diffs the result.

This is one of two places in this README that isn't describing a
deliberate design decision — both are bugs that real testing found and
fixed, left in here because the alternative (a rewritten history implying
everything was always correct) is the more dishonest version of the same
document.

### A prepayment ordering bug, caught against the brief's own worked example

The brief is explicit about prepayment timing: *"applied to the balance
at the start of its month, before interest is charged that month."* An
earlier version of `generateAmortizationSchedule` computed that month's
interest first and only subtracted the prepayment afterward — applying it
at the *end* of the month instead of the start. The bug was quiet:
balances still moved in the right direction, the loan still closed early,
every existing edge-case test (oversized prepayment, same-month summing,
beyond-tenure no-op) still passed, because none of them checked the
*exact* interest figure against a ground truth.

The brief's own worked example is that ground truth: ₹15,00,000 @ 11% for
48 months, ₹1,00,000 prepaid in month 12, should save ≈₹38,477 in
interest and cut the tenure by 3 months. The buggy ordering produced
₹37,238 saved — close enough to look plausible, wrong enough to matter.
Reordering so the prepayment hits the balance *before* that month's
interest accrues (`lib/finance/amortization.ts`) brings it to ₹38,476
saved, a 3-month reduction, and a new total interest of ₹3,22,401 — all
three matching the brief's approximate figures essentially exactly. This
is now a pinned regression test (`tests/sanity-check.ts`), not just a
one-time fix.

### Two channels, not one

```
┌─────────────────────────────┐      ┌──────────────────────────────┐
│   presence channel           │      │   data channel                │
│   (control plane)             │      │   (source of truth)            │
├─────────────────────────────┤      ├──────────────────────────────┤
│  HEARTBEAT (every 1s)        │      │  REQUEST_INIT                 │
│  BYE (on clean unload)       │      │  SYNC_INIT                    │
│                               │      │  DISPATCH_ACTION              │
│  → who's alive, who's leader │      │  → the actual document state  │
└─────────────────────────────┘      └──────────────────────────────┘
        hooks/usePresence.ts              context/WorkspaceProvider.tsx
```

A high-frequency heartbeat and a low-frequency, correctness-critical
document mutation have nothing to do with each other, so they're on
separate `BroadcastChannel`s. This means a burst of heartbeats can never
delay or interleave with a calculator update, and each concern can be
read and tested independently (`lib/sync/peers.ts` has no idea
`WorkspaceProvider` exists).

### State is split into "shared" and "local" — on purpose

The early architecture draft for this project (see note below) put tab
identity, leadership, and the live tab count *inside* the same state
object that gets replicated to every tab. That's a real bug waiting to
happen: every tab has a *different* tab ID and only *one* tab is leader,
so if a leader's full-state snapshot ever overwrote a follower's own
identity, tabs would start fighting over who they are. This app keeps
them apart from the type level up:

- `SharedState` (`types/state.ts`) — calculator inputs, theme, mode,
  comparison scenarios, prepayments, undo history. Identical across every
  tab, replicated via `DISPATCH_ACTION` / `SYNC_INIT`.
- `PresenceSnapshot` (`types/presence.ts`) — this tab's ID, whether it's
  the leader, how many tabs are alive. Different in every tab, never
  serialized into `SharedState`, built entirely from the heartbeat
  protocol in `hooks/usePresence.ts`.

### Sync model: action replication + snapshot fallback

- **Primary path** — every user edit is dispatched locally first
  (optimistic, instant), then broadcast as a `DISPATCH_ACTION` carrying
  the action itself (not a full state diff). Every other tab applies the
  exact same action to its own reducer. This keeps payloads tiny and
  means the only thing that has to be correct is the reducer, which is a
  pure function you can unit test in isolation (see `tests/sanity-check.ts`).
- **Fallback path** — a freshly-mounted tab doesn't know the document's
  history, so it broadcasts `REQUEST_INIT`. Whichever tab currently
  considers itself leader replies with `SYNC_INIT`, a full state
  snapshot. The new tab waits up to 700ms; if nobody answers, it keeps
  its defaults (it's almost certainly the only tab in the room).

### Leader election

Every tab heartbeats its `tabId` and `joinedAt` once a second. Each tab
independently computes the leader as *the surviving peer with the
earliest `joinedAt`* — no votes, no consensus round, no Raft/Paxos. That
shortcut is only safe because `BroadcastChannel` is a genuine local
broadcast medium: every tab hears every heartbeat directly, so every tab
is computing the same answer from the same inputs. If this were routed
through a server or relayed peer-to-peer, the shortcut would break and
you'd actually need a consensus protocol.

A heartbeat going silent for 2.6s (≈2.6 missed beats) drops a peer; a
clean tab close also fires an explicit `BYE` so the remaining tabs update
almost immediately instead of waiting out the timeout. Either way,
because leadership is just "min `joinedAt` among current survivors,"
re-election after the leader disappears isn't a special code path — it's
the same computation naturally returning a different answer.

### Why "echo suppression" isn't actually the problem it sounds like

An early draft of this design called for a `Set<string>` of seen
`transactionId`s to stop "infinite loops" between tabs forwarding
messages back and forth. That framing doesn't apply here:
`BroadcastChannel.postMessage` is defined to **never** deliver a message
back to the channel object that sent it, and nothing in this app relays
or re-broadcasts a message it received — every tab only ever broadcasts
actions *it itself* originated. There is no forwarding, so there's no
loop to suppress.

The `Set<string>` still exists (`WorkspaceProvider`'s `seenIds`), but for
a more mundane reason: idempotency against *duplicate delivery* (e.g. a
retried `SYNC_INIT` race, or a future change that accidentally sends
twice). It's a safety net, not a loop-breaker — the code comments say so
where it matters.

### Versioning is a heuristic, not a lock

Every `DISPATCH_ACTION` carries the sender's local revision count. A
naive design drops any incoming action whose version isn't strictly
greater than the receiver's current version — which sounds rigorous,
but it quietly **loses data** the moment two tabs make a genuinely
concurrent edit: both compute the same "next" version from the same
base, the second one to arrive everywhere looks "stale" by that rule, and
gets silently dropped.

This app doesn't do that. Every received action is applied (after the
duplicate-delivery check above), and the version field is used only as a
development-mode drift heuristic — a console warning if a peer's counter
has drifted suspiciously far from ours, useful for noticing a bug during
development, never something that gates correctness. The honest
trade-off: **concurrent edits to the same field are last-write-wins**,
not merged. For a calculator a single person is using across their own
tabs, that's the right amount of complexity. A true CRDT or
operational-transform layer would be solving a problem this app doesn't
have.

### Cross-tab undo, for free

The undo stack (`history.past`) is a normal field on `SharedState` — it
gets pushed to by the reducer on every undoable action, exactly like
`calculator.amount` does. Because it's just another field, it's already
being replicated by the exact same `DISPATCH_ACTION` pipeline as
everything else. `UNDO` itself is a normal action: dispatch it, every
tab pops its own (already-identical) stack, no special wire format, no
extra plumbing.

### SSR / hydration

Tab identity is generated in a `useEffect` after mount, never during
render — a random ID computed during render would differ between the
server-rendered HTML and the client's first hydration pass and trip a
hydration-mismatch warning. The page also leans on `<Suspense>` around
the one component that calls `useSearchParams()` (for the URL-state
bonus), which is the documented Next.js App Router pattern for that hook.

## Project structure

```
src/
  app/                      Next.js App Router entry (layout, page, globals.css)
  components/
    workspace/              Header, tab presence badge, theme toggle
    calculator/             Input sliders, summary cards, sensitivity grid
    amortization/           Paginated table, Recharts chart, CSV export
    comparison/             Compare-mode scenario cards
    prepayment/              Prepayment planner
    ui/                     Card, Button, Badge, SegmentedControl primitives
  context/
    workspaceReducer.ts      Pure reducer — the single source of truth for state shape
    WorkspaceProvider.tsx     Wires the reducer to the data channel + presence
  hooks/
    useBroadcastChannel.ts   Generic typed BroadcastChannel hook (used by both channels)
    usePresence.ts          Heartbeats, peer registry, leader election
    useDerivedFinance.ts     useMemo wrappers around the pure finance functions
    useUndoShortcut.ts       Ctrl/Cmd+Z → UNDO
    useUrlState.ts          URL query-string bonus
  lib/
    finance/                 emi.ts, amortization.ts, sensitivity.ts, comparison.ts,
                             prepayment.ts, format.ts — pure functions, no React, no DOM
    sync/                    peers.ts (leader election math), ids.ts
    export/                  csv.ts
  types/                     state.ts, actions.ts, sync.ts, presence.ts
tests/
  sanity-check.ts            Reducer + finance math, pinned to the brief's worked examples
  live-sync-check.ts         Real two-tab BroadcastChannel simulation (npm run test)
.github/workflows/ci.yml     Build + both test suites + lint on every push/PR
```

`lib/finance/*` has zero imports from React or the DOM — every formula
in it is independently testable (and is: see `tests/sanity-check.ts`,
which also doubles as a written record of the edge cases this app
handles on purpose).

## Known limitations (stated, not hidden)

- **Concurrency model is last-write-wins per action**, not a CRDT. Two
  tabs editing the *same* field within the same instant will have one
  edit win; this is an explicit, documented trade-off (see "Versioning"
  above), not an oversight.
- **No persistence across reloads.** Closing every tab and reopening
  starts from defaults, by design — the assignment only asks for
  real-time sync between tabs that are open *together*, and there's a
  one-line note in the brief that a fresh tab doesn't need to auto-sync
  with existing tabs (this app does it anyway, via the leadership bonus).
- **Safari's BroadcastChannel during page teardown** can be unreliable,
  which is why the `BYE` message is treated purely as a latency
  optimization — the 2.6s heartbeat timeout is the real, browser-agnostic
  guarantee that a closed tab eventually drops off everyone else's count.
- **Leader hydration has a narrow race window**: if a brand-new tab opens
  in the exact moment between the old leader dying and a new leader's
  first heartbeat settling, it falls back to defaults instead of hydrating.
  Rare in practice, and the failure mode is "shows defaults," not a crash.

## Tech stack

Next.js 14 (App Router) · React 18 (hooks only) · TypeScript (strict,
`noUncheckedIndexedAccess`) · Tailwind CSS · Recharts · PapaParse ·
`BroadcastChannel`. No backend, no state-management library, no UI
component library — everything in `components/ui` is hand-rolled on top
of Tailwind so the whole dependency surface stays auditable in one sitting.
