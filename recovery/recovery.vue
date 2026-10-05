<template>
  <div class="sr">
    <!-- header -->
    <header class="sr-head">
      <div class="sr-id">
        <span class="sr-eq">{{ equipment.model }}</span>
        <span class="sr-zone">{{ equipment.zone }}</span>
      </div>
      <div class="sr-run">{{ equipment.badge }}</div>
    </header>

    <!-- NORMAL -->
    <section v-if="!active" class="sr-calm">
      <div class="sr-calm-line">Running &middot; no active warnings or faults</div>
      <div class="sr-calm-sub">{{ equipment.calmSub }}</div>
    </section>

    <!-- WARNING / FAULT -->
    <section v-else class="sr-card" :class="'is-' + active.tier">
      <div class="sr-card-top">
        <span class="sr-tier">{{ active.tier === 'fault' ? 'Fault' : 'Warning' }}</span>
        <span class="sr-elapsed">{{ elapsedText }}</span>
      </div>

      <h2 class="sr-title">{{ active.label }}</h2>
      <p class="sr-meaning">{{ active.meaning }}</p>

      <div class="sr-block">
        <div class="sr-block-h">Corrective action</div>
        <ol class="sr-steps">
          <li v-for="(s, i) in active.steps" :key="i">{{ s }}</li>
        </ol>
      </div>

      <div class="sr-facts">
        <div class="sr-fact">
          <span class="sr-fact-k">Triggered at</span>
          <span class="sr-fact-v">{{ active.threshold }}</span>
        </div>
        <div class="sr-fact">
          <span class="sr-fact-k">Reset behaviour</span>
          <span class="sr-fact-v">{{ active.reset }}</span>
        </div>
        <div class="sr-fact">
          <span class="sr-fact-k">Who may act</span>
          <span class="sr-fact-v" :class="{ 'is-open': active.authorityOpen }">{{ active.authority }}</span>
        </div>
      </div>

      <div class="sr-actions">
        <button
          class="sr-btn"
          :disabled="!active.manualReset"
          @click="send({ payload: { action: 'reset' } })">
          {{ active.manualReset ? 'Reset' : 'Clears automatically' }}
        </button>
        <span class="sr-src">{{ active.source }}</span>
      </div>
    </section>

    <!-- monitored conditions, deliberately quiet -->
    <section class="sr-watch">
      <div class="sr-watch-h">Monitored</div>
      <ul class="sr-watch-list">
        <li v-for="m in monitored" :key="m" :class="{ 'is-on': active && active.label === m }">
          {{ m }}
        </li>
      </ul>
    </section>

    <!-- equipment identity bar -->
    <footer class="sr-foot">
      <span>{{ equipment.line }}</span>
      
      <span class="sr-sim">
        <label>Simulate</label>
        <select v-model="sim" @change="fire">
          <option value="">— healthy —</option>
          <option v-for="c in conditions" :key="c.id" :value="c.id">{{ c.label }} ({{ c.tier }})</option>
        </select>
      </span>
    </footer>
  </div>
</template>

<script>
export default {
  data () {
    return {
      equipment: { model: '', zone: '', line: '', tag: '', badge: '', calmSub: '' },
      conditions: [],
      monitored: [],
      active: null,
      since: null,
      now: Date.now(),
      sim: '',
      ticker: null
    }
  },
  computed: {
    elapsedText () {
      if (!this.since) { return '' }
      const s = Math.max(0, Math.floor((this.now - this.since) / 1000))
      const m = Math.floor(s / 60)
      return m > 0 ? m + ' min ' + (s % 60) + ' s' : s + ' s'
    }
  },
  methods: {
    fire () {
      this.send({ payload: { action: this.sim ? 'raise' : 'reset', id: this.sim } })
    }
  },
  mounted () {
    this.ticker = setInterval(() => { this.now = Date.now() }, 1000)
  },
  unmounted () {
    if (this.ticker) { clearInterval(this.ticker) }
  },
  watch: {
    msg: {
      immediate: true,
      handler (m) {
        if (!m || !m.payload) { return }
        const p = m.payload
        if (p.equipment) { this.equipment = p.equipment }
        if (p.conditions) { this.conditions = p.conditions }
        if (p.monitored) { this.monitored = p.monitored }
        if (Object.prototype.hasOwnProperty.call(p, 'active')) {
          this.active = p.active
          this.since = p.since || null
          this.sim = p.active ? p.active.id : ''
        }
      }
    }
  }
}
</script>

<style>
.sr {
  font-family: "Inter", "Segoe UI", system-ui, sans-serif;
  color: #1d2731;
  padding: 2px 2px 0;
}

/* header */
.sr-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 10px;
  border-bottom: 2px solid #1d2731;
}
.sr-eq { font-size: 20px; font-weight: 500; }
.sr-zone { font-size: 20px; color: #5b6670; margin-left: 10px; }
.sr-run { font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; color: #8a939a; }

/* normal */
.sr-calm { padding: 34px 4px 30px; }
.sr-calm-line { font-size: 17px; }
.sr-calm-sub { font-size: 13px; color: #6b757d; margin-top: 5px; }

/* abnormal card */
.sr-card {
  margin-top: 14px;
  padding: 16px 18px 18px;
  border-left: 6px solid #5b6670;
  background: #f2f4f5;
}
.sr-card.is-warning { border-left-color: #a86b12; background: #fdf3e4; }
.sr-card.is-fault   { border-left-color: #a3231b; background: #fbeceb; }
.sr-card-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.sr-card.is-warning .sr-tier { color: #7d4f08; font-weight: 600; }
.sr-card.is-fault .sr-tier   { color: #a3231b; font-weight: 600; }
.sr-elapsed { color: #6b757d; font-variant-numeric: tabular-nums; text-transform: none; letter-spacing: 0; }
.sr-title { font-size: 21px; font-weight: 600; margin: 8px 0 4px; }
.sr-meaning { font-size: 15px; color: #3d4850; margin: 0 0 14px; }

.sr-block-h {
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b757d;
  margin-bottom: 4px;
}
.sr-steps { margin: 0 0 14px; padding-left: 20px; font-size: 15px; line-height: 1.5; }

.sr-facts { display: grid; grid-template-columns: 1fr 1.2fr 0.6fr; gap: 28px; margin-bottom: 16px; }
.sr-fact { display: flex; flex-direction: column; }
.sr-fact-k {
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b757d;
}
.sr-fact-v { font-size: 14px; margin-top: 2px; line-height: 1.4; }
.sr-fact-v.is-open { color: #5b6670; border-bottom: 1.5px dashed #8a939a; align-self: flex-start; }
.sr-actions { display: flex; align-items: center; gap: 18px; }
.sr-src { font-size: 12px; color: #6b757d; }

.sr-btn {
  padding: 10px 20px;
  font-size: 15px;
  border: none;
  border-radius: 2px;
  background: #3f6e8c;
  color: #fff;
  cursor: pointer;
}
.sr-btn:disabled { background: #d4d8db; color: #7b848b; cursor: not-allowed; }

/* monitored */
.sr-watch { margin-top: 18px; padding-top: 12px; border-top: 1px solid #dde1e4; }
.sr-watch-h {
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b757d;
  margin-bottom: 6px;
}
.sr-watch-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 18px; }
.sr-watch-list li { font-size: 13px; color: #8a939a; }
.sr-watch-list li.is-on { color: #1d2731; font-weight: 500; }

/* equipment identity bar */
.sr-foot {
  margin-top: 16px;
  padding-top: 10px;
  border-top: 1px solid #dde1e4;
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 12px;
  color: #6b757d;
}
.sr-sim { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.sr-sim label { font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; }
.sr-sim select {
  font-size: 12px;
  padding: 3px 6px;
  border: 1px solid #c2c8cc;
  border-radius: 2px;
  background: #fff;
  color: #1d2731;
}
</style>
