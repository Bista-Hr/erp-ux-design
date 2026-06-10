// BISTA HR · data/store — a tiny reactive store so employee self-service submissions show
// up live on the matching admin screens (CRUD stays intact and reactive across the app).
//   makeStore(initial) → { get, set, subscribe, seed }
//   useStore(store)     → [value, setValue]  (re-renders the component on change)
// HRStores holds the cross-cutting collections shared between self-service (Dashboard ▸
// Requests) and the admin screens that action them:
//   exits                → People & Culture ▸ Employee Exit       (Resignation ESS submissions)
//   accommodationRequests→ Employee Engagement ▸ Accommodation    (Accommodation ESS requests)
//   pendingCirculars     → Employee Engagement ▸ Welfare          (Circular / Bereavement ESS)
// Each store starts null and is seeded once by its owning admin module at load (seed() is a
// no-op once set), so the admin screen keeps its demo seed AND receives new ESS items.
function makeStore(initial) {
  let state = initial;
  const subs = new Set();
  return {
    get: () => state,
    set: (u) => { state = typeof u === "function" ? u(state) : u; subs.forEach(f => f()); },
    subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
    seed: (v) => { if (state == null) state = v; },
  };
}

function useStore(store) {
  const [, bump] = React.useState(0);
  React.useEffect(() => store.subscribe(() => bump(x => x + 1)), [store]);
  return [store.get(), store.set];
}

window.HRStores = {
  exits: makeStore(null),
  accommodationRequests: makeStore(null),
  pendingCirculars: makeStore(null),
};
Object.assign(window, { makeStore, useStore });
