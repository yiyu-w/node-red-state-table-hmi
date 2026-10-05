# Recovery demonstrator: Infeed PE jammed

A warning-and-fault recovery screen for one ISC CAM v2.x condition, built in Node-RED with FlowFuse Dashboard and generated from a state table, like the measurement-point screen in the root of this repo.

**Try it in the browser:** https://yiyu-w.github.io/node-red-state-table-hmi/recovery/

Use **Simulate** to raise the warning, then the fault, then press Reset.

## What it tests

One question: if the condition, the corrective action and the reset behaviour sit together on the fault card, does the operator understand the recovery path faster?

It is a demonstrator for testing that interaction, not a replacement HMI and not a visual proposal. The palette is neutral on purpose, and colour only appears when something is abnormal.

## Where the content comes from

Condition, meaning, thresholds, corrective actions and reset rules are taken from the public **ISC CAM Troubleshooting and Reference Manual (v2.x)**, sections "Infeed PE jammed" and "Fault reset". Nothing machine-specific is invented.

The one open cell is **who may act** ("? — to agree"). The manual says reset can come from the Fault page or the PLC, but not who is expected to decide.

## The state table

Each condition is one row: what it is, what it means, what to do, what triggers it, how reset works and who may act. The card renders the row and holds no machine knowledge itself, so adding rows gives the next condition the same interaction.

## Run it locally

From the repo root, after `npm install`:

```
npx node-red --userDir . recovery/flows.json
```

Then open http://localhost:1880/dashboard/recovery.

## Files

| File | What it is |
|---|---|
| `flows.json` | Import into Node-RED: state table, state logic and screen |
| `recovery.vue` | The ui-template widget as a readable file |

The browser preview at `docs/recovery/index.html` is generated from `flows.json` with `npm run build:recovery`.

Verified on Node-RED 5.0.7 with `@flowfuse/node-red-dashboard` 1.32.0.
