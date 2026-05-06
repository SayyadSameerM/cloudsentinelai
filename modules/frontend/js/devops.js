/** devops.js */
const MODULE = 'devops';
let allRisks = [];

document.addEventListener('DOMContentLoaded', () => {
  initPage(MODULE);
  const conns = getConnections(MODULE);
  if (Object.keys(conns).length) showRisksView(conns);
  else showConnectView();

  document.getElementById('btn-connect-github').addEventListener('click', () => openModal('modal-github'));
  document.getElementById('toggle-gh-token').addEventListener('click', function() {
    const t = document.getElementById('github-token');
    t.type = t.type==='password' ? 'text' : 'password';
    this.textContent = t.type==='password' ? 'show' : 'hide';
  });
});

function showConnectView() {
  document.getElementById('view-connect').style.display='';
  document.getElementById('view-scan').style.display='none';
  document.getElementById('view-risks').style.display='none';
  document.getElementById('header-actions').innerHTML='';
}
function showScanView() {
  document.getElementById('view-connect').style.display='none';
  document.getElementById('view-scan').style.display='';
  document.getElementById('view-risks').style.display='none';
}
function showRisksView(conns) {
  document.getElementById('view-connect').style.display='none';
  document.getElementById('view-scan').style.display='none';
  document.getElementById('view-risks').style.display='';
  document.getElementById('header-actions').innerHTML=`
    <button class="btn btn-outline btn-sm" onclick="showConnectView()">Manage Connections</button>
    <button class="btn btn-gradient btn-sm" onclick="startScan()">Re-analyze</button>`;
  const org = conns.github?.org || 'GitHub';
  const el = document.getElementById('connected-repo-name');
  if (el) el.textContent = `${org} — Workflows Connected`;
  loadRisks();
}

async function loadRisks() {
  document.getElementById('risk-list').innerHTML=`<div class="empty-state"><div class="empty-state-icon">...</div><div class="empty-state-title">Loading</div></div>`;
  try {
    allRisks = await fetchRisks(MODULE);
    updateStats(allRisks);
    renderRiskCards(allRisks,'risk-list');
    document.getElementById('last-scan-time').textContent=new Date().toLocaleTimeString();
  } catch(e) { showToast('Failed to load risks','error'); }
}

function filterRisks(priority,btn) {
  document.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderRiskCards(allRisks,'risk-list',priority);
}

async function startScan() {
  const conns=getConnections(MODULE);
  if(!Object.keys(conns).length){showToast('Connect GitHub first','warning');return;}
  showScanView();
  const steps=[
    {label:'Fetching workflow files…',sub:'Reading .github/workflows/ directory',pct:30},
    {label:'Scanning for secrets…',sub:'Regex matching environment variables',pct:55},
    {label:'Checking pipeline structure…',sub:'Looking for test, rollback and monitoring steps',pct:80},
    {label:'Finalizing analysis…',sub:'Prioritizing findings',pct:95},
  ];
  for(const s of steps){
    document.getElementById('scan-label').textContent=s.label;
    document.getElementById('scan-sub').textContent=s.sub;
    document.getElementById('scan-fill').style.width=s.pct+'%';
    await sleep(800+Math.random()*500);
  }
  await triggerScan(MODULE);
  document.getElementById('scan-fill').style.width='100%';
  await sleep(300);
  showToast('Pipeline analysis complete!','success');
  showRisksView(getConnections(MODULE));
}

async function confirmGithubConnect() {
  const org=document.getElementById('github-org').value.trim();
  const token=document.getElementById('github-token').value.trim();
  const consent=document.getElementById('github-consent').checked;
  if(!org){showToast('Please enter your GitHub org/username','warning');return;}
  if(!token&&!DEMO_MODE){showToast('Please enter a personal access token','warning');return;}
  if(!consent){showToast('Please confirm consent','warning');return;}
  closeModal('modal-github');
  setConnection(MODULE,'github',{org,connectedAt:new Date().toISOString()});
  document.getElementById('github-status').innerHTML=`<span style="color:var(--low)">● Connected</span>`;
  document.getElementById('github-card').classList.add('connected');
  showToast('GitHub connected! Analyzing pipelines…','success');
  await sleep(400);
  showRisksView(getConnections(MODULE));
  await sleep(300);
  startScan();
}

function performDisconnect() {
  localStorage.removeItem(`cs_conn_${MODULE}`);
  allRisks=[];
  showToast('GitHub disconnected','info');
  showConnectView();
}

function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
