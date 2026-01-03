// ============================================
// CONFIGURATION
// ============================================
const API_URL = 'http://localhost:5000/api';

// ============================================
// STATE MANAGEMENT
// ============================================
let currentUser = null;
let activeTab = "lost";
let allItems = [];
let selectedEmoji = "📱";
let uploadedImage = null;
let uploadedImageFile = null;
let useEmoji = false;
let currentItemId = null;

// ============================================
// AUTHENTICATION CHECK
// ============================================
function checkAuth() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('🔍 Auth Check:', { hasToken: !!token, hasUser: !!userStr });
    
    if (!token || !userStr) {
        console.log('❌ No token or user, redirecting to login');
        window.location.href = 'login/user_login.html';
        return false;
    }
    
    try {
        currentUser = JSON.parse(userStr);
        console.log('✅ User authenticated:', currentUser);
        return true;
    } catch (error) {
        console.error('Invalid user data:', error);
        logout();
        return false;
    }
}

function displayUserInfo() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userStudentId = document.getElementById('userStudentId');
    
    if (currentUser && userAvatar && userName && userStudentId) {
        // Show first letter of username
        userAvatar.textContent = currentUser.username ? currentUser.username.charAt(0).toUpperCase() : '?';
        // Show username
        userName.textContent = currentUser.username || 'User';
        // Show student ID
        userStudentId.textContent = currentUser.studentId || '---';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login/user_login.html';
}

// ============================================
// API HELPER FUNCTIONS
// ============================================
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                logout();
            }
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
function showToast(message, type = "info") {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement("div");
    toast.className = "toast " + type;

    const icons = {
        success: "✓",
        error: "✕",
        info: "ℹ",
    };

    toast.innerHTML =
        '<span class="toast-icon">' +
        icons[type] +
        "</span>" +
        '<span class="toast-message">' +
        message +
        "</span>" +
        '<button class="toast-close">&times;</button>';

    toastContainer.appendChild(toast);

    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", function () {
        toast.style.animation = "slideIn 0.3s ease-out reverse";
        setTimeout(function () {
            toast.remove();
        }, 300);
    });

    setTimeout(function () {
        if (toast.parentElement) {
            toast.style.animation = "slideIn 0.3s ease-out reverse";
            setTimeout(function () {
                toast.remove();
            }, 300);
        }
    }, 4000);
}

// ============================================
// IMAGE ZOOM (Make global for onclick)
// ============================================
window.openImageZoom = function(imageSrc) {
    const imageZoomModal = document.getElementById('imageZoomModal');
    const zoomedImage = document.getElementById('zoomedImage');
    if (zoomedImage) zoomedImage.src = imageSrc;
    if (imageZoomModal) imageZoomModal.classList.add("active");
}

window.closeImageZoom = function() {
    const imageZoomModal = document.getElementById('imageZoomModal');
    if (imageZoomModal) imageZoomModal.classList.remove("active");
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function getTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return diffDays + " days ago";
    return dateStr.split('T')[0];
}

function formatCommentTime(timeStr) {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return diffMins + "m ago";
    if (diffHours < 24) return diffHours + "h ago";
    if (diffDays < 7) return diffDays + "d ago";
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// ============================================
// DARK MODE
// ============================================
function initDarkMode() {
    console.log('🌙 Initializing dark mode...');
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) {
        console.error('❌ themeToggle button not found!');
        return;
    }
    
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener("click", function() {
        console.log('🌙 Dark mode button clicked!');
        const isDark = document.body.classList.toggle("dark-mode");
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
        console.log('🌙 Dark mode is now:', isDark ? 'enabled' : 'disabled');
    });
}

// ============================================
// FETCH ITEMS FROM API
// ============================================
async function fetchItems() {
    console.log('📥 Fetching items for tab:', activeTab);
    showLoading(true);
    
    try {
        const statusFilter = document.getElementById('statusFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        const sortFilter = document.getElementById('sortFilter');
        
        const params = new URLSearchParams({
            type: activeTab,
            status: statusFilter && statusFilter.value === 'all' ? '' : (statusFilter ? statusFilter.value : ''),
            category: categoryFilter ? categoryFilter.value || '' : '',
            search: searchInput ? searchInput.value || '' : '',
            sort: sortFilter ? sortFilter.value || 'newest' : 'newest'
        });
        
        console.log('🔗 API Call:', `${API_URL}/items?${params}`);
        
        const data = await apiCall(`/items?${params}`);
        allItems = data.items || [];
        
        console.log('✅ Fetched items:', allItems.length);
        renderItems();
    } catch (error) {
        console.error('❌ Fetch items error:', error);
        showToast('Failed to load items: ' + error.message, 'error');
        allItems = [];
        renderItems();
    } finally {
        showLoading(false);
    }
}

// ============================================
// RENDER ITEMS
// ============================================
function renderItems() {
    const itemsGrid = document.getElementById('itemsGrid');
    
    if (!itemsGrid) {
        console.error('❌ itemsGrid element not found');
        return;
    }
    
    if (allItems.length === 0) {
        itemsGrid.innerHTML = '<div class="no-items">No items found matching your filters.</div>';
        return;
    }

    itemsGrid.innerHTML = allItems.map(function (item) {
        const iconHtml = item.image_url
            ? '<img src="' + API_URL.replace('/api', '') + item.image_url + '" alt="' + escapeHtml(item.title) + '" class="zoomable-image">'
            : (item.emoji || '📦');

        const statusBadge = item.status === "claimed"
            ? '<span class="status-badge claimed">Claimed</span>'
            : '<span class="status-badge">Active</span>';

        return (
            '<div class="item-card ' +
            (item.status === "claimed" ? "claimed" : "") +
            '" data-id="' + item.id + '">' +
            statusBadge +
            '<div class="item-content">' +
            '<div class="item-icon">' + iconHtml + "</div>" +
            '<div class="item-details">' +
            "<h3>" + escapeHtml(item.title) + "</h3>" +
            '<div class="item-info">' +
            '<div class="info-row">' +
            '<svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>' +
            "</svg>" +
            escapeHtml(item.location) +
            "</div>" +
            '<div class="info-row">' +
            '<svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>' +
            '<line x1="16" y1="2" x2="16" y2="6"></line>' +
            '<line x1="8" y1="2" x2="8" y2="6"></line>' +
            '<line x1="3" y1="10" x2="21" y2="10"></line>' +
            "</svg>" +
            getTimeAgo(item.date_lost_found) +
            "</div>" +
            '<div class="info-row">' +
            '<svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>' +
            "</svg>" +
            escapeHtml(item.category) +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>"
        );
    }).join("");

    document.querySelectorAll(".item-card").forEach(function (card) {
        card.addEventListener("click", function (e) {
            console.log('🔘 Item card clicked!');
            if (e.target.classList.contains("zoomable-image")) {
                e.stopPropagation();
                openImageZoom(e.target.src);
            } else {
                const itemId = parseInt(this.getAttribute("data-id"));
                console.log('📦 Opening item details for ID:', itemId);
                showItemDetails(itemId);
            }
        });
    });
}

// ============================================
// SHOW ITEM DETAILS
// ============================================
async function showItemDetails(itemId) {
    showLoading(true);
    
    try {
        const itemData = await apiCall(`/items/${itemId}`);
        const item = itemData.item;
        
        const commentsData = await apiCall(`/comments/${itemId}`);
        const comments = commentsData.comments || [];
        
        currentItemId = itemId;
        
        const iconHtml = item.image_url
            ? '<img src="' + API_URL.replace('/api', '') + item.image_url + '" alt="' + escapeHtml(item.title) + '" class="zoomable-image" onclick="event.stopPropagation(); openImageZoom(\'' + API_URL.replace('/api', '') + item.image_url + '\')">'
            : '<div class="detail-icon-large-emoji">' + (item.emoji || '📦') + "</div>";

        const statusColor = item.status === "claimed" ? "#64748b" : "#22c55e";
        const statusText = item.status === "claimed" ? "Claimed" : "Active";
        
        const isOwner = currentUser && item.user_id === currentUser.id;

        const detailsContent = document.getElementById('detailsContent');
        if (!detailsContent) return;

        detailsContent.innerHTML =
            '<div class="detail-icon-large">' + iconHtml + "</div>" +
            '<h2 style="text-align: center; margin-bottom: 8px;">' + escapeHtml(item.title) + "</h2>" +
            '<p style="text-align: center; color: ' + statusColor + '; font-weight: 600; margin-bottom: 24px;">' + statusText + "</p>" +
            '<div class="detail-row">' +
            '<div class="detail-label">Category</div>' +
            '<div class="detail-value">' + escapeHtml(item.category) + "</div>" +
            "</div>" +
            '<div class="detail-row">' +
            '<div class="detail-label">Location</div>' +
            '<div class="detail-value">' + escapeHtml(item.location) + "</div>" +
            "</div>" +
            '<div class="detail-row">' +
            '<div class="detail-label">Date</div>' +
            '<div class="detail-value">' + getTimeAgo(item.date_lost_found) + " (" + item.date_lost_found.split('T')[0] + ")</div>" +
            "</div>" +
            (item.description ? '<div class="detail-row">' +
                '<div class="detail-label">Description</div>' +
                '<div class="detail-value">' + escapeHtml(item.description) + "</div>" +
                "</div>" : "") +
            (item.contact_email ? '<div class="detail-row">' +
                '<div class="detail-label">Contact Email</div>' +
                '<div class="detail-value">' + escapeHtml(item.contact_email) + "</div>" +
                "</div>" : "") +
            (item.contact_phone ? '<div class="detail-row">' +
                '<div class="detail-label">Contact Phone</div>' +
                '<div class="detail-value">' + escapeHtml(item.contact_phone) + "</div>" +
                "</div>" : "") +
            '<div class="action-buttons">' +
            (isOwner && item.status === "active"
                ? '<button class="btn-submit" onclick="markAsClaimed(' + item.id + ')">Mark as Claimed</button>'
                : '') +
            (isOwner && item.status === "claimed"
                ? '<button class="btn-secondary" onclick="markAsActive(' + item.id + ')">Reactivate</button>'
                : '') +
            (isOwner
                ? '<button class="btn-secondary" onclick="deleteItem(' + item.id + ')">Delete Item</button>'
                : '') +
            "</div>" +
            '<div class="comments-section">' +
            '<div class="comments-header">Comments (' + comments.length + ")</div>" +
            '<div class="comment-input-wrapper">' +
            '<input type="text" class="comment-input" id="commentInput" placeholder="Add a comment...">' +
            '<button class="btn-comment" onclick="submitComment()">Post</button>' +
            "</div>" +
            renderComments(comments) +
            "</div>";

        const detailsModal = document.getElementById('detailsModal');
        if (detailsModal) detailsModal.classList.add("active");
    } catch (error) {
        showToast('Failed to load item details', 'error');
        console.error('Item details error:', error);
    } finally {
        showLoading(false);
    }
}

function renderComments(comments) {
    if (!comments || comments.length === 0) {
        return '<div class="no-comments">No comments yet. Be the first to comment!</div>';
    }

    return (
        '<div class="comments-list">' +
        comments.map(function (comment) {
            const isOwner = currentUser && comment.user_id === currentUser.id;
            return (
                '<div class="comment-item">' +
                '<div class="comment-header">' +
                '<span class="comment-author">' + escapeHtml(comment.user_full_name || 'Anonymous') + "</span>" +
                '<span class="comment-time">' + formatCommentTime(comment.created_at) + "</span>" +
                "</div>" +
                '<div class="comment-text">' + escapeHtml(comment.text) + "</div>" +
                (isOwner ? '<button class="comment-delete-btn" onclick="deleteComment(' + comment.id + ')">Delete</button>' : '') +
                "</div>"
            );
        }).join("") +
        "</div>"
    );
}

// ============================================
// COMMENT FUNCTIONS (Make them global for onclick)
// ============================================
window.submitComment = async function() {
    const commentText = document.getElementById("commentInput").value.trim();

    if (!commentText) {
        showToast("Please enter a comment!", "error");
        return;
    }

    showLoading(true);

    try {
        await apiCall(`/comments/${currentItemId}`, {
            method: 'POST',
            body: JSON.stringify({ text: commentText })
        });

        document.getElementById("commentInput").value = '';
        await showItemDetails(currentItemId);
        showToast("Comment posted successfully!", "success");
    } catch (error) {
        showToast("Failed to post comment", "error");
        console.error('Comment error:', error);
    } finally {
        showLoading(false);
    }
}

window.deleteComment = async function(commentId) {
    if (!confirm('Delete this comment?')) return;

    showLoading(true);

    try {
        await apiCall(`/comments/${commentId}`, {
            method: 'DELETE'
        });

        await showItemDetails(currentItemId);
        showToast("Comment deleted!", "success");
    } catch (error) {
        showToast("Failed to delete comment", "error");
        console.error('Delete comment error:', error);
    } finally {
        showLoading(false);
    }
}

// ============================================
// ITEM STATUS FUNCTIONS (Make them global for onclick)
// ============================================
window.markAsClaimed = async function(itemId) {
    if (!confirm('Mark this item as claimed?')) return;

    showLoading(true);

    try {
        await apiCall(`/items/${itemId}/claim`, {
            method: 'PATCH'
        });

        const detailsModal = document.getElementById('detailsModal');
        if (detailsModal) detailsModal.classList.remove("active");
        await fetchItems();
        showToast("Item marked as claimed!", "success");
    } catch (error) {
        showToast("Failed to mark as claimed", "error");
        console.error('Claim error:', error);
    } finally {
        showLoading(false);
    }
}

window.markAsActive = async function(itemId) {
    if (!confirm('Reactivate this item?')) return;

    showLoading(true);

    try {
        await apiCall(`/items/${itemId}/reactivate`, {
            method: 'PATCH'
        });

        const detailsModal = document.getElementById('detailsModal');
        if (detailsModal) detailsModal.classList.remove("active");
        await fetchItems();
        showToast("Item reactivated!", "success");
    } catch (error) {
        showToast("Failed to reactivate item", "error");
        console.error('Reactivate error:', error);
    } finally {
        showLoading(false);
    }
}

window.deleteItem = async function(itemId) {
    if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return;

    showLoading(true);

    try {
        await apiCall(`/items/${itemId}`, {
            method: 'DELETE'
        });

        const detailsModal = document.getElementById('detailsModal');
        if (detailsModal) detailsModal.classList.remove("active");
        await fetchItems();
        showToast("Item deleted successfully!", "success");
    } catch (error) {
        showToast("Failed to delete item", "error");
        console.error('Delete error:', error);
    } finally {
        showLoading(false);
    }
}

// ============================================
// SUBMIT REPORT
// ============================================
async function submitReport() {
    const itemType = document.getElementById("itemType").value;
    const itemName = document.getElementById("itemName").value.trim();
    const itemLocation = document.getElementById("itemLocation").value.trim();
    const itemCategory = document.getElementById("itemCategory").value;
    const itemDescription = document.getElementById("itemDescription").value.trim();
    const contactEmail = document.getElementById("contactEmail").value.trim();
    const contactPhone = document.getElementById("contactPhone").value.trim();

    if (!itemName || !itemLocation) {
        showToast("Please fill in Item Name and Location!", "error");
        return;
    }

    if (itemType === "Lost" && !contactEmail) {
        showToast("Contact Email is required for lost items!", "error");
        return;
    }

    if (!useEmoji && !uploadedImageFile) {
        showToast("Please upload an image or switch to emoji!", "error");
        return;
    }

    showLoading(true);

    try {
        let imageUrl = null;
        
        if (!useEmoji && uploadedImageFile) {
            const formData = new FormData();
            formData.append('image', uploadedImageFile);
            
            const token = localStorage.getItem('token');
            const uploadResponse = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const uploadData = await uploadResponse.json();
                if (!uploadResponse.ok) throw new Error(uploadData.message);
                console.log('📸 Upload response:', uploadData);
                imageUrl = uploadData.url;  // ← FIXED! Use .url not .imageUrl
        }

        const today = new Date().toISOString().split('T')[0];

        const itemData = {
            title: itemName,
            description: itemDescription || null,
            category: itemCategory,
            location: itemLocation,
            dateLostFound: today,
            itemType: itemType.toLowerCase(),
            contactEmail: contactEmail || null,
            contactPhone: contactPhone || null,
            emoji: useEmoji ? selectedEmoji : null,
            imageUrl: imageUrl
        };

        await apiCall('/items', {
            method: 'POST',
            body: JSON.stringify(itemData)
        });

        activeTab = itemType.toLowerCase();
        const lostTab = document.getElementById('lostTab');
        const foundTab = document.getElementById('foundTab');
        const reportModal = document.getElementById('reportModal');
        
        if (activeTab === 'lost') {
            if (lostTab) lostTab.classList.add("active");
            if (foundTab) foundTab.classList.remove("active");
        } else {
            if (foundTab) foundTab.classList.add("active");
            if (lostTab) lostTab.classList.remove("active");
        }

        if (reportModal) reportModal.classList.remove("active");
        await fetchItems();
        showToast("Item reported successfully!", "success");
    } catch (error) {
        showToast("Failed to submit report: " + error.message, "error");
        console.error('Submit error:', error);
    } finally {
        showLoading(false);
    }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    const imageZoomModal = document.getElementById('imageZoomModal');
    const lostTab = document.getElementById('lostTab');
    const foundTab = document.getElementById('foundTab');
    const reportBtn = document.getElementById('reportBtn');
    const reportModal = document.getElementById('reportModal');
    const closeModal = document.getElementById('closeModal');
    const closeDetailsModal = document.getElementById('closeDetailsModal');
    const emojiToggle = document.getElementById('emojiToggle');
    const imageToggle = document.getElementById('imageToggle');
    const itemTypeSelect = document.getElementById('itemType');
    const emojiSelector = document.getElementById('emojiSelector');
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const detailsModal = document.getElementById('detailsModal');
    const submitBtn = document.getElementById('submitBtn');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const statusFilter = document.getElementById('statusFilter');
    const emojiSection = document.getElementById('emojiSection');
    const imageSection = document.getElementById('imageSection');
    const emailRequired = document.getElementById('emailRequired');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (imageZoomModal) {
        imageZoomModal.addEventListener("click", window.closeImageZoom);
        const zoomCloseBtn = imageZoomModal.querySelector(".zoom-close-btn");
        if (zoomCloseBtn) {
            zoomCloseBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                window.closeImageZoom();
            });
        }
    }
    
    if (lostTab) {
        lostTab.addEventListener("click", function () {
            activeTab = "lost";
            lostTab.classList.add("active");
            if (foundTab) foundTab.classList.remove("active");
            fetchItems();
        });
    }

    if (foundTab) {
        foundTab.addEventListener("click", function () {
            activeTab = "found";
            foundTab.classList.add("active");
            if (lostTab) lostTab.classList.remove("active");
            fetchItems();
        });
    }
    
    if (reportBtn) {
        reportBtn.addEventListener("click", function () {
            console.log('🔘 Report button clicked!');
            if (reportModal) reportModal.classList.add("active");
            selectedEmoji = "📱";
            uploadedImage = null;
            uploadedImageFile = null;
            useEmoji = false;
            if (imageToggle) imageToggle.classList.add("active");
            if (emojiToggle) emojiToggle.classList.remove("active");
            if (imageSection) imageSection.classList.remove("hidden");
            if (emojiSection) emojiSection.classList.add("hidden");
            if (uploadArea) {
                uploadArea.classList.remove("has-image");
                uploadArea.innerHTML =
                    '<p style="color: #64748b; margin-bottom: 8px;">Click to upload or drag and drop</p>' +
                    '<p style="color: #94a3b8; font-size: 12px;">PNG, JPG, GIF up to 5MB</p>';
            }
            if (emailRequired) emailRequired.textContent = "*";
            
            document.getElementById("itemName").value = "";
            document.getElementById("itemLocation").value = "";
            document.getElementById("itemDescription").value = "";
            document.getElementById("contactEmail").value = currentUser ? (currentUser.email || "") : "";
            document.getElementById("contactPhone").value = currentUser ? (currentUser.phone || "") : "";
        });
    }

    if (closeModal) {
        closeModal.addEventListener("click", function () {
            if (reportModal) reportModal.classList.remove("active");
        });
    }

    if (closeDetailsModal) {
        closeDetailsModal.addEventListener("click", function () {
            if (detailsModal) detailsModal.classList.remove("active");
        });
    }

    if (emojiToggle) {
        emojiToggle.addEventListener("click", function () {
            useEmoji = true;
            emojiToggle.classList.add("active");
            if (imageToggle) imageToggle.classList.remove("active");
            if (emojiSection) emojiSection.classList.remove("hidden");
            if (imageSection) imageSection.classList.add("hidden");
        });
    }

    if (imageToggle) {
        imageToggle.addEventListener("click", function () {
            useEmoji = false;
            imageToggle.classList.add("active");
            if (emojiToggle) emojiToggle.classList.remove("active");
            if (imageSection) imageSection.classList.remove("hidden");
            if (emojiSection) emojiSection.classList.add("hidden");
        });
    }

    if (itemTypeSelect) {
        itemTypeSelect.addEventListener("change", function () {
            if (this.value === "Found") {
                if (emailRequired) emailRequired.textContent = "(Optional)";
            } else {
                if (emailRequired) emailRequired.textContent = "*";
            }
        });
    }

    if (emojiSelector) {
        emojiSelector.addEventListener("click", function (e) {
            if (e.target.classList.contains("emoji-option")) {
                const allEmojis = emojiSelector.querySelectorAll(".emoji-option");
                for (let i = 0; i < allEmojis.length; i++) {
                    allEmojis[i].classList.remove("selected");
                    }
                e.target.classList.add("selected");
                selectedEmoji = e.target.getAttribute("data-emoji");
            }
        });
    }

    if (uploadArea) {
        uploadArea.addEventListener("click", function () {
            if (imageInput) imageInput.click();
        });
    }

    if (imageInput) {
        imageInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith("image/")) {
                uploadedImageFile = file;
                const reader = new FileReader();
                reader.onload = function (event) {
                    uploadedImage = event.target.result;
                    if (uploadArea) {
                        uploadArea.classList.add("has-image");
                        uploadArea.innerHTML =
                            '<img src="' + uploadedImage + '" class="preview-image" alt="Preview">';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (reportModal) {
        reportModal.addEventListener("click", function (e) {
            if (e.target === reportModal) {
                reportModal.classList.remove("active");
            }
        });
    }

    if (detailsModal) {
        detailsModal.addEventListener("click", function (e) {
            if (e.target === detailsModal) {
                detailsModal.classList.remove("active");
            }
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener("click", submitReport);
    }
    
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                fetchItems();
            }, 500);
        });
    }

    if (categoryFilter) categoryFilter.addEventListener("change", fetchItems);
    if (sortFilter) sortFilter.addEventListener("change", fetchItems);
    if (statusFilter) statusFilter.addEventListener("change", fetchItems);
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
    
    console.log('✅ Event listeners setup complete');
}

// ============================================
// INITIALIZATION
// ============================================
async function init() {
    console.log('🚀 Initializing dashboard...');
    
    if (!checkAuth()) {
        console.log('❌ Auth failed, stopping initialization');
        return;
    }
    
    console.log('✅ Auth passed, setting up UI...');
    
    displayUserInfo();
    initDarkMode();
    setupEventListeners();
    
    console.log('📡 Fetching initial data...');
    
    await fetchItems();
    
    console.log('✅ Dashboard initialized successfully!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}