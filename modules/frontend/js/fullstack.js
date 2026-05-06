/** fullstack.js */
const MODULE = 'fullstack';
let allRisks = [];

document.addEventListener('DOMContentLoaded', () => {
  initPage(MODULE);
  const conns = getConnections(MODULE);
  if (Object.keys(conns).length) showRisksView(conns);
  else showConnectView();
  document.getElementById('btn-connect-apigw').addEventListener('click', () => openModal('modal-apigw'));
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
    <button class="btn btn-outline btn-sm" onclick="showConnectView()">Manage</button>
    <button class="btn btn-gradient btn-sm" onclick="startScan()">Rescan</button>`;
  loadRisks();
}

async function loadRisks() {
  document.getElementById('risk-list').innerHTML=`<div class="empty-state"><div class="empty-state-icon">...</div><div class="empty-state-title">Loading</div></div>`;
  try {
    allRisks = await fetchRisks(MODULE);
    updateStats(allRisks);
    renderRiskCards(allRisks,'risk-list');
    document.getElementById('last-scan-time').textContent=new Date().toLocaleTimeString();
  } catch { showToast('Failed to load risks','error'); }
}

function filterRisks(priority,btn) {
  document.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderRiskCards(allRisks,'risk-list',priority);
}

async function startScan() {
  const conns=getConnections(MODULE);
  if(!Object.keys(conns).length){showToast('Connect API Gateway first','warning');return;}
  showScanView();
  const steps=[
    {label:'Discovering API endpoints…',sub:'Listing all resources and methods',pct:25},
    {label:'Checking authentication…',sub:'Reviewing authorization on each endpoint',pct:50},
    {label:'Analyzing CloudWatch metrics…',sub:'Checking 5XX rates and average latency',pct:75},
    {label:'Finalizing findings…',sub:'Prioritizing security and performance risks',pct:92},
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
  showToast('API scan complete!','success');
  showRisksView(getConnections(MODULE));
}

async function confirmApigwConnect() {
  const url=document.getElementById('api-url-input').value.trim();
  const consent=document.getElementById('apigw-consent').checked;
  if(!url&&!DEMO_MODE){showToast('Please enter your API URL','warning');return;}
  if(!consent){showToast('Please confirm consent','warning');return;}
  closeModal('modal-apigw');
  setConnection(MODULE,'apigw',{url,connectedAt:new Date().toISOString()});
  document.getElementById('apigw-status').innerHTML=`<span style="color:var(--low)">● Connected</span>`;
  showToast('API Gateway connected! Starting scan…','success');
  await sleep(400);
  showRisksView(getConnections(MODULE));
  await sleep(300);
  startScan();
}

function performDisconnect() {
  localStorage.removeItem(`cs_conn_${MODULE}`);
  allRisks=[];
  showToast('Disconnected from API Gateway','info');
  showConnectView();
}

function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
