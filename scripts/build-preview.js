// Generates docs/index.html from flows.json.
//
// The preview is not a rewrite of the screen. It takes the ui-template,
// the function nodes and the wiring straight out of flows.json and runs
// them in the browser. The only difference from the running flow is where
// the function nodes execute: here in the page, in Node-RED on the server.
//
// Run after any change to flows.json:  npm run build:preview

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const flows = JSON.parse(fs.readFileSync(path.join(root, 'flows.json'), 'utf8'))

const tpl = flows.find(n => n.type === 'ui-template')
const page = flows.find(n => n.type === 'ui-page')
const table = flows.find(n => n.type === 'function' && n.name === 'state table')
if (!tpl || !page || !table) { throw new Error('flows.json is missing the template, page or state table node') }

// Split the single-file component the ui-template holds
const src = tpl.format
const template = src.slice(src.indexOf('<template>') + '<template>'.length, src.lastIndexOf('</template>'))
const script = src.slice(src.indexOf('<script>') + '<script>'.length, src.indexOf('</script>'))
  .replace('export default', 'return')
const style = src.slice(src.indexOf('<style>') + '<style>'.length, src.indexOf('</style>'))

// Only the nodes the preview needs to execute, with their wiring
const runtimeNodes = flows
  .filter(n => ['inject', 'function', 'ui-template', 'ui-control'].includes(n.type))
  .map(n => ({ id: n.id, type: n.type, name: n.name, func: n.func, wires: n.wires || [] }))

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Show the table itself, without the connect-handling lines above it
const tableSource = table.func.slice(table.func.indexOf('// ----')).trim()

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.name)} · Node-RED state-table HMI (browser preview)</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body { font-family: "Inter", "Segoe UI", system-ui, sans-serif; background: #eef0f1; color: #1d2731; }
  .bar { height: 56px; background: #1d2731; color: #fff; display: flex; align-items: center; padding: 0 18px; font-size: 20px; }
  .shell { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: calc(100% - 56px); }
  .nav { background: #1d2731; padding: 8px; }
  .nav-item { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 3px; background: #2b3641; color: #fff; font-size: 15px; }
  .nav-item svg { width: 20px; height: 20px; fill: #fff; flex: none; }
  main { padding: 12px; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
  .group { background: #fff; border: 1px solid #c9ced2; border-radius: 2px; padding: 14px 16px; }
  .note { margin: 0; font-size: 13px; line-height: 1.55; color: #3d4850; max-width: 72ch; }
  .note a { color: #3f6e8c; }
  details summary { cursor: pointer; font-size: 14px; font-weight: 600; padding: 2px 0; }
  details summary:focus-visible, .btn:focus-visible { outline: 2px solid #1d2731; outline-offset: 2px; }
  details p { font-size: 13px; line-height: 1.55; color: #3d4850; max-width: 72ch; margin: 8px 0 10px; }
  pre { margin: 0; overflow-x: auto; background: #f5f6f7; border: 1px solid #dde1e4; padding: 12px 14px; font: 12.5px/1.5 ui-monospace, "SF Mono", Menlo, monospace; color: #1d2731; }
${style}
  @media (max-width: 700px) {
    .shell { grid-template-columns: 1fr; }
    .nav { display: none; }
    .c-label { width: auto; }
    .c-input { white-space: nowrap; }
    .c-input input { width: 76px; }
    .btn { white-space: nowrap; }
  }
</style>
</head>
<body>
<div class="bar">${esc(page.name)}</div>
<div class="shell">
  <nav class="nav" aria-label="Pages">
    <div class="nav-item" aria-current="page">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1c0-.21-.07-.41-.18-.57L13 9.16V4h-2v5.16L5.18 18.43c-.11.16-.18.36-.18.57m1 3a3 3 0 0 1-3-3c0-.6.18-1.16.5-1.63L9 7.81V6a1 1 0 0 1-1-1V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1v1.81l5.5 9.56c.32.47.5 1.03.5 1.63a3 3 0 0 1-3 3zm7-6 1.34-1.34L16.27 18H7.73l2.66-4.61z"/></svg>
      ${esc(page.name)}
    </div>
  </nav>
  <main>
    <div class="group"><div id="screen"></div></div>
    <div class="group">
      <p class="note">Browser preview of a Node-RED screen built with FlowFuse Dashboard. It runs the same template, function nodes and wiring as <code>flows.json</code>. In the running flow the reading is evaluated by the Node-RED server; here that same function runs in your browser. Source and setup: <a href="https://github.com/yiyu-w/node-red-state-table-hmi">github.com/yiyu-w/node-red-state-table-hmi</a></p>
    </div>
    <div class="group">
      <details>
        <summary>The state table this screen is generated from</summary>
        <p>Everything machine-specific lives in this array. The screen has no knowledge of what a reactor is: replace the table and you get another machine's screen with the same interaction, the same colour meanings and the same reset vocabulary.</p>
        <pre>${esc(tableSource)}</pre>
      </details>
    </div>
  </main>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue@3.5.43/dist/vue.global.prod.js"></script>
<script>
(function () {
  const nodes = ${JSON.stringify(runtimeNodes)};
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const store = {};
  const flow = { get: k => store[k], set: (k, v) => { store[k] = v } };
  const clone = m => JSON.parse(JSON.stringify(m));
  let vm = null;

  // Deliver a message to a node and follow its wires, as the runtime would
  function deliver (id, msg) {
    const n = byId[id];
    if (!n) { return }
    if (n.type === 'ui-template') { if (vm) { vm.msg = clone(msg) } return }
    if (n.type !== 'function') { return }
    const out = new Function('msg', 'flow', 'node', n.func)(clone(msg), flow, { warn: console.warn, error: console.error });
    if (out == null) { return }
    const outs = Array.isArray(out) ? out : [out];
    outs.forEach((m, i) => { if (m) { (n.wires[i] || []).forEach(w => deliver(w, m)) } });
  }
  function emitFrom (id, msg) { (byId[id].wires[0] || []).forEach(w => deliver(w, msg)) }

  const component = (function () { ${script} })();
  const tplNode = nodes.find(n => n.type === 'ui-template');
  component.template = ${JSON.stringify(template)};
  component.mixins = [{
    data () { return { msg: null } },
    methods: { send (m) { emitFrom(tplNode.id, m) } }
  }];

  vm = Vue.createApp(component).mount('#screen');

  // Start-up, as in the flow: the inject fires once, then this browser connects
  nodes.filter(n => n.type === 'inject').forEach(n => emitFrom(n.id, { payload: Date.now() }));
  nodes.filter(n => n.type === 'ui-control').forEach(n => emitFrom(n.id, { payload: 'connect' }));
})();
</script>
</body>
</html>
`

fs.writeFileSync(path.join(root, 'docs', 'index.html'), html)
console.log('docs/index.html written from flows.json (' + runtimeNodes.length + ' runtime nodes)')
