// =======================
// GLOBAL DOM ELEMENTS & CONSTANTS
const adminStatusFilter = document.getElementById("adminStatusFilter");
// =======================

// Page Containers
const loginPage = document.getElementById("loginPage");
const studentPage = document.getElementById("dashboardPage");
const adminPage = document.getElementById("adminPage");

// Forms
const loginForm = document.getElementById("loginForm");

// Tables
const studentTableBody = document.getElementById("studentTableBody");
const studentRecentBody = document.getElementById("studentRecentBody");
const adminTableBody = document.getElementById("adminTableBody");

// Text Elements
const welcomeText = document.getElementById("welcomeText");
const adminWelcome = document.getElementById("adminWelcome");

// Buttons
const newRequestBtn = document.getElementById("newRequestBtn");
const uploadRequestBtn = document.getElementById("uploadRequestBtn");
const studentLogoutBtn = document.getElementById("studentLogoutBtn");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");

// Modals & Modal Controls
const requestModal = document.getElementById("requestModal");
const uploadModal = document.getElementById("uploadModal");
const cancelModal = document.getElementById("cancelModal");
const cancelUpload = document.getElementById("cancelUpload");
const submitRequest = document.getElementById("submitRequest");
const submitUpload = document.getElementById("submitUpload");
const detailsModal = document.getElementById("detailsModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

// Status Counters
const studentPendingCount = document.getElementById("studentPendingCount");
const studentCompletedCount = document.getElementById("studentCompletedCount");
const adminTotal = document.getElementById("adminTotal");
const adminPending = document.getElementById("adminPending");
const adminProcessing = document.getElementById("adminProcessing");
const adminCompleted = document.getElementById("adminCompleted");

// Shared State
let currentUser = "";
let requests = []; // Store all document requests

// =======================
// EVENT HANDLERS
// =======================

// Login Handler
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "student123" && password === "12345") {
    loginPage.style.display = "none";
    studentPage.style.display = "block";
    welcomeText.textContent = `Welcome, ${username}`;
    currentUser = username;
    renderTables();
  } else if (username === "admin123" && password === "adminpass") {
    loginPage.style.display = "none";
    adminPage.style.display = "block";
    adminWelcome.textContent = `Welcome, ${username}`;
    currentUser = username;
    renderTables();
  } else {
    alert("Invalid username or password.");
  }
}
loginForm.addEventListener("submit", handleLogin);

// Logout Handler
function handleLogout() {
  studentPage.style.display = "none";
  adminPage.style.display = "none";
  currentUser = "";
  loginPage.style.display = "flex";
  loginForm.reset();
}
if (studentLogoutBtn) studentLogoutBtn.addEventListener("click", handleLogout);
if (adminLogoutBtn) adminLogoutBtn.addEventListener("click", handleLogout);

// Modal Handlers
newRequestBtn.onclick = () => (requestModal.style.display = "flex");
uploadRequestBtn.onclick = () => (uploadModal.style.display = "flex");
cancelModal.onclick = () => (requestModal.style.display = "none");
cancelUpload.onclick = () => (uploadModal.style.display = "none");
closeModal.onclick = () => (detailsModal.style.display = "none");
window.onclick = (event) => {
  if (event.target === requestModal) requestModal.style.display = "none";
  if (event.target === uploadModal) uploadModal.style.display = "none";
  if (event.target === detailsModal) detailsModal.style.display = "none";
};

// Student Request Submission Handler
function handleStudentRequest() {
  const docType = document.getElementById("docType").value;
  const purpose = document.getElementById("purpose").value.trim();
  if (!docType) {
    alert("Please select a document type.");
    return;
  }
  const newReq = {
    id: generateRequestId(),
    student: currentUser,
    type: docType,
    purpose,
    date: new Date().toISOString().split("T")[0],
    status: "Pending"
  };
  requests.push(newReq);
  requestModal.style.display = "none";
  renderTables();
}
submitRequest.addEventListener("click", handleStudentRequest);

// Student Upload Submission Handler
function handleStudentUpload() {
  const docType = document.getElementById("uploadDocType").value;
  // Use uploadFilesInput for consistency with drag-and-drop
  const files = uploadFilesInput && uploadFilesInput.files ? uploadFilesInput.files : document.getElementById("uploadFiles").files;
  if (!docType) {
    alert("Please select a document type.");
    return;
  }
  if (!files || files.length === 0) {
    alert("Please upload a file.");
    return;
  }
  const file = files[0];
  const uploadUrl = URL.createObjectURL(file);
  const newReq = {
    id: generateRequestId(),
    student: currentUser,
    type: docType,
    purpose: "Uploaded file(s)",
    date: new Date().toISOString().split("T")[0],
    status: "Pending",
    uploadUrl // for admin to download
  };
  requests.push(newReq);
  uploadModal.style.display = "none";
  renderTables();
}
submitUpload.addEventListener("click", handleStudentUpload);

// =======================
// RENDER FUNCTIONS
// =======================
function renderTables() {
  // Student Table
  if (studentTableBody) {
    studentTableBody.innerHTML = "";
    requests
      .filter((r) => r.student === currentUser)
      .forEach((r) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${r.id}</td>
          <td>${r.type}</td>
          <td>${r.date}</td>
          <td><span class="badge ${getBadgeClass(r.status)}">${r.status}</span></td>
          <td>
            <a href="#" onclick="viewDetails('${r.id}')">View Details</a>
            ${r.status === "Completed" && r.fileUrl ? `<a href="${r.fileUrl}" download style="margin-left:8px;">Download</a>` : ""}
          </td>
        `;
        studentTableBody.appendChild(row);
      });
  // Student Recent Table (last 5 requests)
  const studentRecentBody = document.getElementById("studentRecentBody");
  if (studentRecentBody) {
    studentRecentBody.innerHTML = "";
    requests
      .filter((r) => r.student === currentUser)
      .slice(-5)
      .reverse()
      .forEach((r) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${r.id}</td>
          <td>${r.type}</td>
          <td>${r.date}</td>
          <td><span class="badge ${getBadgeClass(r.status)}">${r.status}</span></td>
          <td>
            <a href="#" onclick="viewDetails('${r.id}')">View Details</a>
            ${r.status === "Completed" && r.fileUrl ? `<a href="${r.fileUrl}" download style="margin-left:8px;">Download</a>` : ""}
          </td>
        `;
        studentRecentBody.appendChild(row);
      });
  }

    // Update student counters
    const pending = requests.filter((r) => r.student === currentUser && r.status === "Pending").length;
    const completed = requests.filter((r) => r.student === currentUser && r.status === "Completed").length;
    studentPendingCount.textContent = pending;
    studentCompletedCount.textContent = completed;
  }

  // Admin Table
  if (adminTableBody) {
    adminTableBody.innerHTML = "";
    let filteredRequests = requests;
    if (adminStatusFilter && adminStatusFilter.value) {
      filteredRequests = requests.filter(r => r.status === adminStatusFilter.value);
    }
    filteredRequests.forEach((r) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.id}</td>
        <td>${r.student}</td>
        <td>${r.type}</td>
        <td>${r.date}</td>
        <td><span class="badge ${getBadgeClass(r.status)}">${r.status}</span></td>
        <td>
          <div class="admin-actions">
            <select class="action-select" title="Change Status" onchange="updateStatus('${r.id}', this.value)">
              <option ${r.status === "Pending" ? "selected" : ""}>Pending</option>
              <option ${r.status === "Processing" ? "selected" : ""}>Processing</option>
              <option ${r.status === "Completed" ? "selected" : ""}>Completed</option>
            </select>
            <button class="action-btn" title="View Details" onclick="viewDetails('${r.id}')">
              <span class="action-text">View Details</span>
            </button>
            ${r.uploadUrl ? `<a class="action-btn" title="Download Upload" href="${r.uploadUrl}" download><span class="action-text">Download Upload</span></a>` : ""}
            ${r.purpose !== 'Uploaded file(s)' ? `<button class="action-btn" title="Send File" onclick="showSendFileModal('${r.id}')"><span class="action-text">Send File</span></button>` : ''}
            ${r.fileUrl ? `<a class="action-btn" title="Download Sent File" href="${r.fileUrl}" download><span class="action-text">Download Sent File</span></a>` : ""}
          </div>
        </td>
      `;
      adminTableBody.appendChild(row);
    });
if (adminStatusFilter) {
  adminStatusFilter.addEventListener("change", renderTables);
}
// Show modal for admin to send file to student (simple file input)
window.showSendFileModal = (id) => {
  const req = requests.find((r) => r.id === id);
  if (!req) return;
  modalContent.innerHTML = `
    <strong>Send File to Student for Request ${req.id}</strong><br><br>
    <input type="file" id="adminSendFileInput"><br><br>
    <button onclick="sendFileToStudent('${req.id}')">Send</button>
    <button onclick="closeModal.click()">Cancel</button>
  `;
  detailsModal.style.display = "flex";
};

// Simulate sending file to student (store file URL in request)
window.sendFileToStudent = (id) => {
  const req = requests.find((r) => r.id === id);
  const input = document.getElementById("adminSendFileInput");
  if (req && input && input.files.length > 0) {
    // Simulate file upload by creating a local object URL
    const file = input.files[0];
    req.fileUrl = URL.createObjectURL(file);
    req.status = "Completed";
    detailsModal.style.display = "none";
    renderTables();
    alert("File sent to student and request marked as Completed.");
  } else {
    alert("Please select a file to send.");
  }
};

    // Update admin counters
    adminTotal.textContent = requests.length;
    adminPending.textContent = requests.filter((r) => r.status === "Pending").length;
    adminProcessing.textContent = requests.filter((r) => r.status === "Processing").length;
    adminCompleted.textContent = requests.filter((r) => r.status === "Completed").length;
  }
}

// =======================
// HELPERS
// =======================
function generateRequestId() {
  return `#DSA-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, "0")}`;
}

function getBadgeClass(status) {
  if (status === "Pending") return "orange";
  if (status === "Processing") return "yellow";
  if (status === "Completed") return "green";
  return "";
}

// =======================
// VIEW DETAILS
// =======================
window.viewDetails = (id) => {
  const req = requests.find((r) => r.id === id);
  if (req) {
    modalContent.innerHTML = `
      <strong>Request ID:</strong> ${req.id}<br>
      <strong>Student:</strong> ${req.student}<br>
      <strong>Type:</strong> ${req.type}<br>
      <strong>Purpose:</strong> ${req.purpose}<br>
      <strong>Date:</strong> ${req.date}<br>
      <strong>Status:</strong> ${req.status}
    `;
    detailsModal.style.display = "flex";
  }
};

// =======================
// UPDATE STATUS (Admin)
// =======================
window.updateStatus = (id, newStatus) => {
  const req = requests.find((r) => r.id === id);
  if (req) {
    req.status = newStatus;
    renderTables();
  }
};

// Drag and drop for upload modal
const uploadDropZone = document.getElementById("uploadDropZone");
const uploadFilesInput = document.getElementById("uploadFiles");
const uploadPreview = document.getElementById("uploadPreview");

if (uploadDropZone && uploadFilesInput) {
  uploadDropZone.addEventListener("click", () => uploadFilesInput.click());

  uploadDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadDropZone.classList.add("dragover");
  });
  uploadDropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    uploadDropZone.classList.remove("dragover");
  });
  uploadDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadDropZone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFilesInput.files = e.dataTransfer.files;
      showUploadPreview(e.dataTransfer.files[0]);
      uploadDropZone.classList.add("has-file");
    }
  });
  uploadFilesInput.addEventListener("change", (e) => {
    if (uploadFilesInput.files && uploadFilesInput.files.length > 0) {
      showUploadPreview(uploadFilesInput.files[0]);
      uploadDropZone.classList.add("has-file");
    } else {
      uploadDropZone.classList.remove("has-file");
    }
  });
}

function showUploadPreview(file) {
  if (!file || !uploadPreview) {
    if (uploadDropZone) uploadDropZone.classList.remove("has-file");
    return;
  }
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    uploadPreview.src = "google-docs.png";
  }
}
// Document Type Management
let documentTypes = [
  "Certificate of Enrollment",
  "Good Moral Certificate",
  "Application Form for Vehicle Pass"
];
const docTypeSelect = document.getElementById("docType");
const uploadDocTypeSelect = document.getElementById("uploadDocType");
const docTypeList = document.getElementById("docTypeList");
const newDocTypeInput = document.getElementById("newDocTypeInput");
const addDocTypeBtn = document.getElementById("addDocTypeBtn");
const searchDocTypeInput = document.getElementById("searchDocTypeInput");

function renderDocTypeOptions() {
  let filteredTypes = documentTypes;
  if (searchDocTypeInput && searchDocTypeInput.value.trim()) {
    const q = searchDocTypeInput.value.trim().toLowerCase();
    filteredTypes = documentTypes.filter(type => type.toLowerCase().includes(q));
  }
  if (docTypeSelect) {
    docTypeSelect.innerHTML = '<option value="">Select Document Type</option>' + documentTypes.map(type => `<option>${type}</option>`).join("");
  }
  if (uploadDocTypeSelect) {
    uploadDocTypeSelect.innerHTML = '<option value="">Select Document Type</option>' + documentTypes.map(type => `<option>${type}</option>`).join("");
  }
  if (docTypeList) {
    docTypeList.innerHTML = filteredTypes.map((type, idx) => `
      <li style="margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;background:#f5f6fa;padding:8px 12px;border-radius:8px;">
        <span style="font-size:15px;">${type}</span>
        <button class='delete-doc-type-btn' style='padding:0;margin:0;border:none;background:none;cursor:pointer;' onclick='deleteDocType(${documentTypes.indexOf(type)})'>
          <img src="trashcan.png" alt="Delete" style="width:18px;height:18px;object-fit:contain;display:block;">
        </button>
      </li>`).join("");
  }
if (searchDocTypeInput) {
  searchDocTypeInput.addEventListener("input", renderDocTypeOptions);
}
}

window.deleteDocType = function(idx) {
  documentTypes.splice(idx, 1);
  renderDocTypeOptions();
}

if (addDocTypeBtn && newDocTypeInput) {
  addDocTypeBtn.onclick = function() {
    const val = newDocTypeInput.value.trim();
    if (val && !documentTypes.includes(val)) {
      documentTypes.push(val);
      newDocTypeInput.value = "";
      renderDocTypeOptions();
    }
  };
}

// Initial render
renderDocTypeOptions();
