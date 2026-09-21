# Node-RED state-table HMI

A measurement-entry screen for one sample point on a process line, built in Node-RED with FlowFuse Dashboard 2.0. The screen is generated from a state table: swap the table and you get another machine's screen with the same interaction model.

**Try it in the browser:** https://yiyu-w.github.io/node-red-state-table-hmi/
**Walkthrough (90 s):** [recording link]

The browser preview runs the same template, function nodes and wiring as `flows.json`. The one difference is where evaluation happens: in the running flow the Node-RED server judges each reading; in the preview that function runs in the page.

## Run it

Needs Node.js 20 or newer.

```
git clone https://github.com/yiyu-w/node-red-state-table-hmi.git
cd node-red-state-table-hmi
npm install
npm start
```

Open http://localhost:1880/dashboard/reactor-uit. The editor is at http://localhost:1880.

## What it does

Five fields for a reactor-outlet sample. Enter values and submit; the server evaluates each against the state table and returns a state per field.

- **Nothing is coloured until something is wrong.** In the normal case there is no amber, no red and no status text. Colour is reserved so that when it appears it means something.
- **Two tiers, not one alarm.** Near limit is amber and the line keeps running. Outside limit is red and blocks release pending a supervisor decision.
- **The reset rule is on the screen.** When a field goes abnormal, a panel says what clears it and who has authority to act.
- **Evaluation is server-side.** The widget submits and asks; it never decides whether a value is acceptable. A screen that judges its own values can be bypassed by a screen that lies.
- **The boundary is stated, not implied.** 0.20 % against a 0.20 % limit reads as near limit: compliant, with nothing left.
- **Every connect gets a fresh screen definition.** A `ui-control` node re-sends the state table to each browser as it connects, so a reload or a redeploy never leaves the screen without its table, and a second operator opening the page does not disturb the first.

Try 0.55, 0.12, 0.10, 61, 11 (all in range), then set Diglyceride to 0.18, 0.20 and 0.22.

## Standardise the frame, configure the parameters

Everything machine-specific lives in one array in the `state table` function node:

| Field | Meaning |
|---|---|
| `label`, `unit`, `step` | what the operator reads and how the input behaves |
| `normal` | band inside which nothing is shown |
| `warn` | band outside which the value is a fault |
| `limit` | optional hard limit; crossing it is always a fault |
| `reset` | what clears this condition, in plain words |
| `authority` | who is allowed to act on it |

Replace that array and the frame, colour meanings and reset vocabulary stay the same. Variation lives in data, not in screens.

## Flow

```
load screen (inject, once at start) ─┐
client connected (ui-control) ───────┴─> state table ─┬─> cache table
                                                      └─> Measurement point (ui-template)

Measurement point ─> evaluate against table ─> Measurement point
```

## Updating the preview

`docs/index.html` is generated from `flows.json`. After changing the flow in the editor, run:

```
npm run build:preview
```

and commit both files.

Verified on Node-RED 5.0.7 with `@flowfuse/node-red-dashboard` 1.31.0.
