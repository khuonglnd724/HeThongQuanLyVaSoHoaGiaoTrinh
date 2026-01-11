// Simple test client targeting API Gateway only.
// If API Gateway is down, calls fail (no direct ai-service access is used here).

const outputEl = document.getElementById('output');
const baseUrlInput = document.getElementById('baseUrl');

// Valid JWT token signed with API Gateway secret
const DUMMY_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWNsaWVudCIsImlhdCI6MTc2Nzk0NjQ5NSwiZXhwIjoxNzk5NDgyNDk1fQ.rBA46lpi24eh5XdBAKwjsIoXvxv5oaqaLEYaFHj1FI4';

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
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': DUMMY_TOKEN
    },
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
    headers: {
      'Authorization': DUMMY_TOKEN
    },
    body: formData,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}

// Actions
async function doHealth() {
  log('Calling /api/ai/health via gateway...');
  const data = await api('GET', '/api/ai/health');
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
  const job = await api('POST', '/api/ai/suggest', payload);
  log(job);
}

async function doChat() {
  const payload = {
    messages: [{ role: 'user', content: document.getElementById('chatMessage').value }],
    syllabusId: document.getElementById('chatSyllabus').value,
    conversationId: document.getElementById('chatConv').value || undefined,
  };
  log('Submitting chat job...');
  const job = await api('POST', '/api/ai/chat', payload);
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
  const job = await api('POST', '/api/ai/diff', payload);
  log(job);
}

async function doJob() {
  const jobId = document.getElementById('jobId').value.trim();
  if (!jobId) return log('Enter jobId');
  log(`Fetching job ${jobId}...`);
  const data = await api('GET', `/api/ai/jobs/${jobId}`);
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
  const res = await apiForm('/api/ai/documents/ingest', formData);
  log(res);
}

async function doSearch() {
  const syllabusId = document.getElementById('searchSyllabus').value.trim();
  const query = document.getElementById('searchQuery').value.trim();
  
  if (!syllabusId || !query) return log('Enter syllabusId and query');
  
  log('Searching documents...');
  const data = await api('GET', `/api/ai/documents/search?syllabus_id=${encodeURIComponent(syllabusId)}&query=${encodeURIComponent(query)}`);
  log(data);
}

async function doSummary() {
  const payload = {
    content: document.getElementById('summaryContent').value,
    length: document.getElementById('summaryLength').value,
  };
  const syllabusId = document.getElementById('summarySyllabus').value.trim();
  if (syllabusId) payload.syllabusId = syllabusId;
  log('Submitting summary job...');
  const job = await api('POST', '/api/ai/summary', payload);
  log(job);
}

async function doCloCheck() {
  const cloText = document.getElementById('cloCheckClos').value.trim();
  const ploText = document.getElementById('cloCheckPlos').value.trim();
  const clos = cloText.split('\n').map(s => s.trim()).filter(s => s);
  const plos = ploText.split('\n').map(s => s.trim()).filter(s => s);
  
  if (!clos.length || !plos.length) return log('Enter CLOs and PLOs');
  
  const payload = {
    clos,
    plos,
  };
  const syllabusId = document.getElementById('cloCheckSyllabus').value.trim();
  if (syllabusId) payload.syllabusId = syllabusId;
  log('Submitting CLO check job...');
  const job = await api('POST', '/api/ai/clo-check', payload);
  log(job);
}

async function doSimilarClo() {
  const currentClo = document.getElementById('similarClo').value.trim();
  if (!currentClo) return log('Enter current CLO');
  
  const payload = {
    currentCLO: currentClo,
    limit: parseInt(document.getElementById('similarLimit').value) || 5,
  };
  const subject = document.getElementById('similarSubject').value.trim();
  if (subject) payload.subjectArea = subject;
  const level = document.getElementById('similarLevel').value.trim();
  if (level) payload.level = level;
  
  log('Submitting similar CLO search...');
  const job = await api('POST', '/api/ai/suggest-similar-clos', payload);
  log(job);
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
bind('btnSummary', doSummary);
bind('btnCloCheck', doCloCheck);
bind('btnSimilarClo', doSimilarClo);
bind('btnSearch', doSearch);
bind('btnJob', doJob);
bind('btnIngest', doIngest);

document.getElementById('saveBase').addEventListener('click', () => {
  log(`Base URL set to ${getBase()}`);
});

// Default log
log('Ready. All requests go through API Gateway base URL.');
