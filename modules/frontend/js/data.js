/** data.js — Data Engineering module */
const MODULE = 'data-eng';
let allRisks = [];

document.addEventListener('DOMContentLoaded', () => {
  initPage(MODULE);
  const conns = getConnections(MODULE);
  if (Object.keys(conns).length) showRisksView(conns);
  else showConnectView();
  document.getElementById('btn-connect-data').addEventListener('click', () => openModal('modal-data'));
});

function showConnectView() {
  document.getElementById('view-connect').style.display = '';
  document.getElementById('view-scan').style.display   = 'none';
  document.getElementById('view-risks').style.display  = 'none';
  document.getElementById('header-actions').innerHTML  = '';
}
function showScanView() {
  document.getElementById('view-connect').style.display = 'none';
  document.getElementById('view-scan').style.display    = '';
  document.getElementById('view-risks').style.display   = 'none';
}
function showRisksView(conns) {
  document.getElementById('view-connect').style.display = 'none';
  document.getElementById('view-scan').style.display    = 'none';
  document.getElementById('view-risks').style.display   = '';
  document.getElementById('header-actions').innerHTML = `
    <button class="btn btn-outline btn-sm" onclick="showConnectView()">Manage</button>
    <button class="btn btn-gradient btn-sm" onclick="startScan()">Rescan</button>`;
  loadRisks();
}

async function loadRisks() {
  document.getElementById('risk-list').innerHTML = `
    <div class="empty-state"><div class="empty-state-icon">...</div><div class="empty-state-title">Loading risks</div></div>`;
  try {
    allRisks = await fetchRisks(MODULE);
    updateStats(allRisks);
    renderRiskCards(allRisks, 'risk-list');
    document.getElementById('last-scan-time').textContent = new Date().toLocaleTimeString();

    /* Service summary counters */
    const s3risks    = allRisks.filter(r => r.resource === 'Data Storage').length;
    const ddbRisks   = allRisks.filter(r => r.resource === 'DynamoDB Table').length;
    const glueRisks  = allRisks.filter(r => r.resource === 'AWS Glue Job').length;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('s3-count',   `${s3risks} risk${s3risks   !== 1 ? 's' : ''} detected`);
    set('ddb-count',  `${ddbRisks} risk${ddbRisks  !== 1 ? 's' : ''} detected`);
    set('glue-count', `${glueRisks} risk${glueRisks !== 1 ? 's' : ''} detected`);
  } catch (e) {
    showToast('Failed to load risks', 'error');
  }
}

function filterRisks(priority, btn) {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderRiskCards(allRisks, 'risk-list', priority);
}

async function startScan() {
  const conns = getConnections(MODULE);
  if (!Object.keys(conns).length) { showToast('Connect AWS data environment first', 'warning'); return; }
  showScanView();

  const steps = [
    { label: 'Discovering S3 data buckets…',    sub: 'Listing all buckets in account',                        pct: 20 },
    { label: 'Checking public access settings…', sub: 'Verifying Block Public Access on each bucket',          pct: 40 },
    { label: 'Auditing encryption config…',      sub: 'Checking SSE settings on S3 and DynamoDB',             pct: 60 },
    { label: 'Reviewing DynamoDB tables…',       sub: 'Checking server-side encryption status',               pct: 75 },
    { label: 'Analyzing Glue job history…',      sub: 'Checking last 5 runs for repeated failures',           pct: 90 },
  ];

  for (const s of steps) {
    document.getElementById('scan-label').textContent = s.label;
    document.getElementById('scan-sub').textContent   = s.sub;
    document.getElementById('scan-fill').style.width  = s.pct + '%';
    await sleep(800 + Math.random() * 500);
  }

  await triggerScan(MODULE);
  document.getElementById('scan-fill').style.width = '100%';
  await sleep(350);
  showToast('Data environment scan complete!', 'success');
  showRisksView(getConnections(MODULE));
}

async function confirmDataConnect() {
  const accountId = document.getElementById('data-account-id').value.trim();
  const consent   = document.getElementById('data-consent').checked;
  if (!accountId && !DEMO_MODE) { showToast('Please enter your AWS Account ID', 'warning'); return; }
  if (!consent) { showToast('Please confirm your consent', 'warning'); return; }
  closeModal('modal-data');
  setConnection(MODULE, 'aws-data', { accountId, connectedAt: new Date().toISOString() });
  document.getElementById('aws-data-status').innerHTML = `<span style="color:var(--low)">● Connected</span>`;
  document.getElementById('aws-data-card').classList.add('connected');
  showToast('AWS data environment connected! Starting scan…', 'success');
  await sleep(400);
  showRisksView(getConnections(MODULE));
  await sleep(300);
  startScan();
}

function performDisconnect() {
  localStorage.removeItem(`cs_conn_${MODULE}`);
  allRisks = [];
  showToast('Disconnected from AWS data environment', 'info');
  showConnectView();
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function sleep(ms)      { return new Promise(r => setTimeout(r, ms)); }
