// Simple test client targeting API Gateway only.
// If API Gateway is down, calls fail (no direct ai-service access is used here).

const outputEl = document.getElementById('output');
const baseUrlInput = document.getElementById('baseUrl');

function log(data) {
  outputEl.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function getBase() {
  const url = baseUrlInput.value.trim();
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

async function api(method, path, body) {
  const url = `${getBase()}${path}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}

async function apiForm(path, formData) {
  const url = `${getBase()}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}

// Actions
async function doHealth() {
  log('Calling /health via gateway...');
  const data = await api('GET', '/health');
  log(data);
}

async function doSuggest() {
  const payload = {
    content: document.getElementById('suggestContent').value,
    focusArea: document.getElementById('suggestFocus').value,
  };
  const syllabusId = document.getElementById('suggestSyllabus').value.trim();
  if (syllabusId) payload.syllabusId = syllabusId;
  log('Submitting suggest job...');
  const job = await api('POST', '/ai/suggest', payload);
  log(job);
}

async function doChat() {
  const payload = {
    messages: [{ role: 'user', content: document.getElementById('chatMessage').value }],
    syllabusId: document.getElementById('chatSyllabus').value,
    conversationId: document.getElementById('chatConv').value || undefined,
  };
  log('Submitting chat job...');
  const job = await api('POST', '/ai/chat', payload);
  log(job);
}

async function doDiff() {
  const payload = {
    oldContent: document.getElementById('diffOld').value,
    newContent: document.getElementById('diffNew').value,
  };
  const syllabusId = document.getElementById('diffSyllabus').value.trim();
  if (syllabusId) payload.syllabusId = syllabusId;
  log('Submitting diff job...');
  const job = await api('POST', '/ai/diff', payload);
  log(job);
}

async function doJob() {
  const jobId = document.getElementById('jobId').value.trim();
  if (!jobId) return log('Enter jobId');
  log(`Fetching job ${jobId}...`);
  const data = await api('GET', `/ai/jobs/${jobId}`);
  log(data);
}

async function doIngest() {
  const syllabusId = document.getElementById('ingestSyllabus').value.trim();
  const subjectName = document.getElementById('ingestSubject').value.trim();
  const fileInput = document.getElementById('ingestFile');
  const file = fileInput.files[0];

  if (!syllabusId) return log('Enter syllabus ID');
  if (!file) return log('Select a file');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('syllabus_id', syllabusId);
  if (subjectName) formData.append('subject_name', subjectName);

  log('Uploading document...');
  const res = await apiForm('/ai/documents/ingest', formData);
  log(res);
}

// Wire buttons
function bind(id, fn) {
  document.getElementById(id).addEventListener('click', async () => {
    try {
      await fn();
    } catch (err) {
      log(`Error: ${err.message}`);
    }
  });
}

bind('btnHealth', doHealth);
bind('btnSuggest', doSuggest);
bind('btnChat', doChat);
bind('btnDiff', doDiff);
bind('btnJob', doJob);
bind('btnIngest', doIngest);

document.getElementById('saveBase').addEventListener('click', () => {
  log(`Base URL set to ${getBase()}`);
});

// Default log
log('Ready. All requests go through API Gateway base URL.');
