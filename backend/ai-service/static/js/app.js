// Configuration
const API_BASE = "http://localhost:8000";
const POLLING_INTERVAL = 1000; // 1 second
const POLLING_MAX_ATTEMPTS = 60; // 60 seconds max

// Tab Navigation
document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        // Remove active class from all tabs
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

        // Add active class to clicked tab
        btn.classList.add("active");
        const tabId = btn.getAttribute("data-tab");
        document.getElementById(tabId).classList.add("active");
    });
});

// Suggest Form
document.getElementById("suggestForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const syllabusId = document.getElementById("suggestSyllabusId").value;
    const section = document.getElementById("suggestSection").value;
    const textDraft = document.getElementById("suggestText").value;

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/ai/suggest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                syllabusId,
                section: section || undefined,
                textDraft: textDraft || undefined,
            }),
        });

        const data = await response.json();
        showLoading(false);

        if (response.ok) {
            const jobId = data.jobId;
            displayResult(
                `Yêu cầu đã gửi! Job ID: <strong>${jobId}</strong><br>Đang xử lý...`,
                "suggest",
                "success"
            );
            pollJobStatus(jobId, "suggestResult");
        } else {
            displayResult(
                `Lỗi: ${data.detail || response.statusText}`,
                "suggest",
                "error"
            );
        }
    } catch (error) {
        showLoading(false);
        displayResult(`Lỗi kết nối: ${error.message}`, "suggest", "error");
    }
});

// Chat Form
document.getElementById("chatForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = document.getElementById("chatMessage").value;
    const syllabusId = document.getElementById("chatSyllabusId").value;

    // Add user message to chat history
    addChatMessage(message, "user");

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/ai/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: message }],
                syllabusId: syllabusId || undefined,
            }),
        });

        const data = await response.json();
        showLoading(false);

        if (response.ok) {
            const jobId = data.jobId;
            pollChatStatus(jobId, message);
        } else {
            addChatMessage(`Lỗi: ${data.detail || response.statusText}`, "assistant");
        }
    } catch (error) {
        showLoading(false);
        addChatMessage(`Lỗi kết nối: ${error.message}`, "assistant");
    }

    document.getElementById("chatMessage").value = "";
});

// Diff Form
document.getElementById("diffForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const syllabusId = document.getElementById("diffSyllabusId").value;
    const baseVersionId = document.getElementById("diffBaseVersion").value;
    const targetVersionId = document.getElementById("diffTargetVersion").value;

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/ai/diff`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                syllabusId,
                baseVersionId,
                targetVersionId,
            }),
        });

        const data = await response.json();
        showLoading(false);

        if (response.ok) {
            displayResult(
                `Yêu cầu đã gửi! Job ID: <strong>${data.jobId}</strong><br>Đang so sánh...`,
                "diff",
                "success"
            );
            pollJobStatus(data.jobId, "diffResult");
        } else {
            displayResult(
                `Lỗi: ${data.detail || response.statusText}`,
                "diff",
                "error"
            );
        }
    } catch (error) {
        showLoading(false);
        displayResult(`Lỗi kết nối: ${error.message}`, "diff", "error");
    }
});

// CLO-PLO Check Form
document.getElementById("cloCheckForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const syllabusId = document.getElementById("cloCheckSyllabusId").value;
    const clos = document.getElementById("cloCheckClos").value.split(",").map((s) => s.trim());
    const plos = document.getElementById("cloCheckPlos").value.split(",").map((s) => s.trim());

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/ai/clo-check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                syllabusId,
                cloList: clos,
                ploList: plos,
            }),
        });

        const data = await response.json();
        showLoading(false);

        if (response.ok) {
            displayResult(
                `Yêu cầu đã gửi! Job ID: <strong>${data.jobId}</strong><br>Đang kiểm tra...`,
                "clo-check",
                "success"
            );
            pollJobStatus(data.jobId, "cloCheckResult");
        } else {
            displayResult(
                `Lỗi: ${data.detail || response.statusText}`,
                "clo-check",
                "error"
            );
        }
    } catch (error) {
        showLoading(false);
        displayResult(`Lỗi kết nối: ${error.message}`, "clo-check", "error");
    }
});

// Summary Form
document.getElementById("summaryForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const syllabusId = document.getElementById("summarySyllabusId").value;
    const versionId = document.getElementById("summaryVersion").value;

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/ai/summary`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                syllabusId,
                versionId: versionId || undefined,
            }),
        });

        const data = await response.json();
        showLoading(false);

        if (response.ok) {
            displayResult(
                `Yêu cầu đã gửi! Job ID: <strong>${data.jobId}</strong><br>Đang tóm tắt...`,
                "summary",
                "success"
            );
            pollJobStatus(data.jobId, "summaryResult");
        } else {
            displayResult(
                `Lỗi: ${data.detail || response.statusText}`,
                "summary",
                "error"
            );
        }
    } catch (error) {
        showLoading(false);
        displayResult(`Lỗi kết nối: ${error.message}`, "summary", "error");
    }
});

// Helper Functions
function showLoading(show = true) {
    const indicator = document.getElementById("loadingIndicator");
    if (show) {
        indicator.classList.remove("hidden");
    } else {
        indicator.classList.add("hidden");
    }
}

function displayResult(content, tabId, type = "info") {
    const resultDiv = document.getElementById(`${tabId}Result`);
    if (resultDiv) {
        resultDiv.className = `result ${type}`;
        resultDiv.innerHTML = content;
    }
}

async function checkJobStatus(jobId = null) {
    if (!jobId) {
        jobId = document.getElementById("jobId").value;
    }

    if (!jobId) {
        alert("Vui lòng nhập Job ID");
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/ai/jobs/${jobId}`);
        const data = await response.json();
        showLoading(false);

        if (response.ok) {
            const html = `
                <div class="result-item">
                    <strong>Job ID:</strong> ${data.jobId}<br>
                    <strong>Task Type:</strong> ${data.taskType}<br>
                    <strong>Status:</strong> <span style="color: ${getStatusColor(data.status)}">${data.status}</span><br>
                    <strong>Progress:</strong> ${data.progress}%<br>
                    ${data.result ? `<strong>Result:</strong><pre>${JSON.stringify(data.result, null, 2)}</pre>` : ""}
                    ${data.error ? `<strong>Error:</strong> ${data.error}` : ""}
                </div>
            `;
            displayResult(html, "jobs", data.status === "succeeded" ? "success" : "info");
        } else {
            displayResult(
                `Lỗi: ${data.detail || response.statusText}`,
                "jobs",
                "error"
            );
        }
    } catch (error) {
        showLoading(false);
        displayResult(`Lỗi kết nối: ${error.message}`, "jobs", "error");
    }
}

function getStatusColor(status) {
    const colors = {
        succeeded: "#10b981",
        failed: "#ef4444",
        running: "#3b82f6",
        queued: "#f59e0b",
        canceled: "#6b7280",
    };
    return colors[status] || "#6b7280";
}

async function pollJobStatus(jobId, resultElementId, attempts = 0) {
    if (attempts >= POLLING_MAX_ATTEMPTS) {
        displayResult(
            `Timeout: Công việc chưa hoàn thành sau 60 giây. Job ID: ${jobId}`,
            resultElementId.replace("Result", ""),
            "warning"
        );
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/ai/jobs/${jobId}`);
        const data = await response.json();

        if (data.status === "succeeded") {
            const html = `
                <div class="result-item success">
                    <strong>✅ Hoàn thành!</strong><br>
                    <strong>Job ID:</strong> ${data.jobId}<br>
                    <strong>Task Type:</strong> ${data.taskType}<br>
                    <strong>Result:</strong>
                    <pre>${JSON.stringify(data.result, null, 2)}</pre>
                </div>
            `;
            document.getElementById(resultElementId).innerHTML = html;
        } else if (data.status === "failed") {
            displayResult(
                `❌ Lỗi: ${data.error || "Công việc thất bại"}`,
                resultElementId.replace("Result", ""),
                "error"
            );
        } else {
            // Still processing, poll again
            setTimeout(() => {
                pollJobStatus(jobId, resultElementId, attempts + 1);
            }, POLLING_INTERVAL);
        }
    } catch (error) {
        displayResult(`Lỗi kết nối: ${error.message}`, resultElementId.replace("Result", ""), "error");
    }
}

async function pollChatStatus(jobId, userMessage, attempts = 0) {
    if (attempts >= POLLING_MAX_ATTEMPTS) {
        addChatMessage(
            "Timeout: Phản hồi chưa nhận được sau 60 giây.",
            "assistant"
        );
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/ai/jobs/${jobId}`);
        const data = await response.json();

        if (data.status === "succeeded") {
            const answer = data.result?.answer?.content || "Không có phản hồi";
            addChatMessage(answer, "assistant");
        } else if (data.status === "failed") {
            addChatMessage(
                `Lỗi: ${data.error || "Không thể xử lý yêu cầu"}`,
                "assistant"
            );
        } else {
            setTimeout(() => {
                pollChatStatus(jobId, userMessage, attempts + 1);
            }, POLLING_INTERVAL);
        }
    } catch (error) {
        addChatMessage(`Lỗi kết nối: ${error.message}`, "assistant");
    }
}

function addChatMessage(message, sender) {
    const chatHistory = document.getElementById("chatHistory");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = message;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
