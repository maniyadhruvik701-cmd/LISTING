const COMPANIES = [
    "AJIO", "AJIO-DE", "AJIO TANUKA", "AMZONE", "MY-DE", "MY-JIHU",
    "T CENTER TC", "WEBSITE HONEST", "RTW", "MS", "BB", "DREAM", "TRENDY CULTURE"
];

// State
let currentPage = 1;
const entriesPerPage = 20;
let stockData = JSON.parse(localStorage.getItem('stockData')) || [];

// DOM Elements
const container = document.getElementById('container');
const signInBtn = document.getElementById('signIn');
const signUpBtn = document.getElementById('signUp');
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const navItems = document.querySelectorAll('.sidebar li[data-tab]');
const logoutBtn = document.getElementById('logout-btn');
const dataTableBody = document.getElementById('data-tbody');
const add50RowsBtn = document.getElementById('add-50-rows');
const saveDataBtn = document.getElementById('save-data');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const jumpPageBtn = document.getElementById('jump-page-btn');
const jumpPageInput = document.getElementById('jump-page-input');
const generateReportBtn = document.getElementById('generate-report');
const searchInput = document.getElementById('search-input');

// === Auth Logic ===
/* 
// Auto-login disabled so you can test the Sign In page
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

if (isLoggedIn) {
    authSection.classList.add('hidden');
    authSection.style.display = 'none';
    dashboardSection.classList.remove('hidden');
} 
*/

signInBtn.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

signUpBtn.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Strict Login Validation
    const emailInput = document.getElementById('login-email').value;
    const passwordInput = document.getElementById('login-password').value;

    // Email: maniyadhruvik07@gmail.com
    // Password: maniya@#07
    if (emailInput === 'maniyadhruvik07@gmail.com' && passwordInput === 'maniya@#07') {
        // Success
        localStorage.setItem('isLoggedIn', 'true');
        authSection.classList.add('hidden');
        setTimeout(() => {
            authSection.style.display = 'none';
            dashboardSection.classList.remove('hidden');
            renderTable();
        }, 600);
    } else {
        // Failure
        alert("Invalid Email or Password! Access Denied.");
    }
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Account created! Please Sign In.");
    container.classList.remove("right-panel-active");
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    authSection.style.display = 'flex';
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
});

// === Navigation Logic ===
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all
        navItems.forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

        // Add active to clicked
        item.classList.add('active');
        const tabId = item.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// Populate Datalist - Removed as we have columns now.

// === Data Entry Logic ===
// Search Listener
searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderTable();
});

function renderTable() {
    dataTableBody.innerHTML = '';
    const query = searchInput.value.toLowerCase().trim();

    // 1. Prepare Data (Filter if needed)
    let dataMap = stockData.map((row, index) => ({ row, index }));

    if (query) {
        dataMap = dataMap.filter(item => {
            const design = (item.row.designNo || '').toLowerCase();
            const date = (item.row.date || '').toLowerCase();
            const remark = (item.row.remark || '').toLowerCase();
            return design.includes(query) || date.includes(query) || remark.includes(query);
        });
    }

    // 2. Pagination Calculation
    const totalItems = dataMap.length;
    const totalPages = Math.ceil(totalItems / entriesPerPage) || 1;

    // Adjust currentPage if out of bounds (unless searching leads to 0 results, we stay on page 1)
    if (currentPage > totalPages && totalItems > 0) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;

    // 3. Auto-expand rows (Only if NOT searching)
    if (!query && stockData.length < endIndex) {
        while (stockData.length < endIndex) {
            stockData.push(createEmptyRow());
        }
        localStorage.setItem('stockData', JSON.stringify(stockData));
        // Re-map because stockData grew
        dataMap = stockData.map((row, index) => ({ row, index }));
    }

    // 4. Slice for Page
    // If searching, we interpret pagination over the FILTERED results
    const pageItems = dataMap.slice(startIndex, endIndex);

    if (pageItems.length === 0 && query) {
        dataTableBody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding:20px;">No results found</td></tr>';
        pageInfo.innerText = `Page 0 of 0`;
        return;
    }

    // 5. Render Rows
    pageItems.forEach((item) => {
        const globalIndex = item.index;
        const row = item.row;
        const tr = document.createElement('tr');

        let companyCells = '';
        COMPANIES.forEach(comp => {
            companyCells += `<td><input type="text" class="table-input" style="width: ${Math.max((row[comp] || '').length + 2, 10)}ch;" value="${row[comp] || ''}" oninput="this.style.width = (Math.max(this.value.length + 2, 10)) + 'ch'" onchange="updateData(${globalIndex}, '${comp}', this.value)"></td>`;
        });

        tr.innerHTML = `
            <td>${globalIndex + 1}</td>
            <td><input type="date" class="table-input" value="${row.date || ''}" onchange="updateData(${globalIndex}, 'date', this.value)"></td>
            <td><input type="text" class="table-input" style="width: ${Math.max((row.designNo || '').length + 2, 12)}ch;" value="${row.designNo || ''}" placeholder="Design" oninput="this.style.width = (Math.max(this.value.length + 2, 12)) + 'ch'" onchange="updateData(${globalIndex}, 'designNo', this.value)"></td>
            ${companyCells}
            <td><input type="text" class="table-input" value="${row.remark || ''}" placeholder="Remark" onchange="updateData(${globalIndex}, 'remark', this.value)"></td>
            <td><button style="color:red; background:none; border:none; cursor:pointer;" onclick="deleteRow(${globalIndex})"><i class="fas fa-trash"></i></button></td>
        `;
        dataTableBody.appendChild(tr);
    });

    pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    // Save is manual or on specific update, not general render
}

function createEmptyRow() {
    // Helper to init all company keys
    const row = { date: '', designNo: '', remark: '' };
    COMPANIES.forEach(c => row[c] = '');
    return row;
}

function addEmptyRows(count) {
    for (let i = 0; i < count; i++) {
        stockData.push(createEmptyRow());
    }
    localStorage.setItem('stockData', JSON.stringify(stockData));
    renderTable();
}

window.updateData = function (index, field, value) {
    stockData[index][field] = value;
    localStorage.setItem('stockData', JSON.stringify(stockData));
};

window.deleteRow = function (index) {
    if (confirm('Delete this row?')) {
        stockData.splice(index, 1);
        renderTable();
    }
}

add50RowsBtn.addEventListener('click', () => {
    addEmptyRows(50);
});

saveDataBtn.addEventListener('click', () => {
    localStorage.setItem('stockData', JSON.stringify(stockData));
    alert('Data Saved!');
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

nextPageBtn.addEventListener('click', () => {
    // Calculate Total Pages dynamically
    const query = searchInput.value.toLowerCase().trim();
    let effectiveLen = stockData.length;
    if (query) {
        effectiveLen = stockData.filter(r =>
            (r.designNo || '').toLowerCase().includes(query) ||
            (r.remark || '').toLowerCase().includes(query) ||
            (r.date || '').toLowerCase().includes(query)
        ).length;
    }
    const totalPages = Math.ceil(effectiveLen / entriesPerPage) || 1;

    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    } else if (!query) {
        // Only offer to create new page if NOT searching
        if (confirm("Create new page?")) {
            // Add rows but don't auto-render twice
            const needed = 20;
            for (let i = 0; i < needed; i++) stockData.push(createEmptyRow());
            currentPage++;
            renderTable();
        }
    }
});

jumpPageBtn.addEventListener('click', () => {
    const page = parseInt(jumpPageInput.value);

    // Calculate Total Pages
    const query = searchInput.value.toLowerCase().trim();
    let effectiveLen = stockData.length;
    if (query) {
        effectiveLen = stockData.filter(r =>
            (r.designNo || '').toLowerCase().includes(query) ||
            (r.remark || '').toLowerCase().includes(query) ||
            (r.date || '').toLowerCase().includes(query)
        ).length;
    }
    const totalPages = Math.ceil(effectiveLen / entriesPerPage) || 1;

    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
    } else if (page > totalPages && !query) {
        if (confirm(`Page ${page} doesn't exist. Create up to it?`)) {
            const rowsNeeded = (page * entriesPerPage) - stockData.length;
            addEmptyRows(rowsNeeded);
            currentPage = page;
            renderTable(); // ensure we see the new page
        }
    }
});

// === Report Logic ===
generateReportBtn.addEventListener('click', () => {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const reportContainer = document.getElementById('report-results');

    if (!startDate || !endDate) {
        alert("Please select start and end dates");
        return;
    }

    // 1. Filter ALL Rows by Date & Design Existence
    const validRows = stockData.filter(row => {
        if (!row.date || row.date < startDate || row.date > endDate) return false;
        if (!row.designNo) return false;
        return true;
    });

    if (validRows.length === 0) {
        reportContainer.innerHTML = '<div class="empty-state">No entries found for this period.</div>';
        return;
    }

    // 2. Aggregate Pending Counts by Design
    const designStats = {};

    validRows.forEach(row => {
        const d = row.designNo;

        if (!designStats[d]) {
            designStats[d] = {};
            COMPANIES.forEach(c => designStats[d][c] = 0);
        }

        // Check if row has ANY data
        const rowHasData = COMPANIES.some(comp => {
            const v = row[comp];
            return v !== undefined && v !== null && v.trim() !== '';
        });

        // Check each company column for this row INDIVIDUALLY
        COMPANIES.forEach(comp => {
            const val = row[comp];
            const isCellFilled = (val !== undefined && val !== null && val.trim() !== '');

            if (isCellFilled) {
                // If filled, it's not pending. Count = 0.
            } else {
                // Cell is Empty. Is it Pending?

                // Normal Company -> If empty, it is pending
                designStats[d][comp] += 1;
            }
        });
    });

    const designs = Object.keys(designStats).sort();

    // 3. Render Matrix Report
    let html = '<div style="overflow-x:auto;"><table border="1" style="width:100%; text-align:center; border-collapse: collapse;">';

    // Header
    html += `<thead style="background:#f1f5f9;">
                <tr>
                    <th style="padding:10px;">Design No</th>`;

    COMPANIES.forEach(c => {
        html += `<th style="padding:10px;">${c}</th>`;
    });

    html += `<th style="padding:10px; background:#e2e8f0;">Total Pending</th>
            </tr></thead><tbody>`;

    // Track Grand Totals
    const columnTotals = {};
    COMPANIES.forEach(c => columnTotals[c] = 0);
    let grandOverallTotal = 0;

    // Rows
    designs.forEach(design => {
        // Calculate Row Total First
        let rowTotal = 0;
        COMPANIES.forEach(c => rowTotal += designStats[design][c]);

        // Filter: Show only if there are pending items
        if (rowTotal === 0) return;

        html += `<tr>
                    <td style="padding:10px; font-weight:bold;">${design}</td>`;

        COMPANIES.forEach(comp => {
            const pendingCount = designStats[design][comp];

            // Accumulate Column Total
            columnTotals[comp] += pendingCount;

            const bg = (pendingCount === 0) ? '#f8f9fa' : '#fff';
            const color = (pendingCount === 0) ? '#ccc' : '#000';

            html += `<td style="padding:10px; background:${bg}; color:${color};">${pendingCount}</td>`;
        });

        // Accumulate Grand Overall Total
        grandOverallTotal += rowTotal;

        html += `<td style="padding:10px; font-weight:bold; background:#e2e8f0;">${rowTotal}</td>
                </tr>`;
    });

    html += '</tbody>';

    // Footer (Grand Total)
    html += `<tfoot style="background:#2d3436; color:white; font-weight:bold;">
                <tr>
                    <td style="padding:12px;">GRAND TOTAL</td>`;

    COMPANIES.forEach(c => {
        html += `<td style="padding:12px;">${columnTotals[c]}</td>`;
    });

    html += `<td style="padding:12px; background:#4361ee;">${grandOverallTotal}</td>
            </tr></tfoot>`;

    html += '</table></div>';
    reportContainer.innerHTML = html;
});

// Initial Render on Load
renderTable();
