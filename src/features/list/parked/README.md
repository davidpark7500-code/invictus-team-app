# List Builder (parked)

Not routed, not shipped. These screens, `src/data/types.ts` (Prospect, Customer, STAGES)
and the `prospects` / `customers` tables in `supabase/migrations/0001_init.sql` are kept
for a later release.

To re-enable: move the three screens back under `src/app/(tabs)/list/` (index,
prospect/[id], customer/[id]), add a `_layout.tsx` stack, and add the tab to both
`src/app/(tabs)/_layout.tsx` and `_layout.web.tsx`.

Note: the List Builder needs per-person accounts. With the single shared team login,
everyone would see and edit the same list.
