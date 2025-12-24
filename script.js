let lostItems = [
  {
    id: 1,
    title: "Black Leather Wallet",
    location: "Library 3rd Floor",
    date: "2024-12-18",
    category: "Personal Items",
    icon: "🎒",
    status: "active",
    description: "Black leather wallet with university ID inside",
    contactEmail: "john@university.edu",
    contactPhone: "(555) 123-4567",
    comments: [
      {
        id: 1,
        author: "Jane Doe",
        text: "I think I saw this at the library yesterday!",
        time: "2024-12-19T10:30:00",
      },
      {
        id: 2,
        author: "Mike Smith",
        text: "Did it have a student ID with the initials J.D.?",
        time: "2024-12-19T14:20:00",
      },
    ],
  },
  {
    id: 2,
    title: "Silver iPhone 15",
    location: "Student Center",
    date: "2024-12-17",
    category: "Electronics",
    icon: "📱",
    status: "active",
    description: "Silver iPhone 15 with blue case",
    contactEmail: "jane@university.edu",
    comments: [],
  },
  {
    id: 3,
    title: "Blue Water Bottle",
    location: "Gym Locker Room",
    date: "2024-12-16",
    category: "Accessories",
    icon: "🧴",
    status: "claimed",
    description: "Blue Hydro Flask with stickers",
    contactEmail: "mike@university.edu",
    comments: [
      {
        id: 1,
        author: "Owner",
        text: "Thank you! I picked it up from the front desk.",
        time: "2024-12-18T09:00:00",
      },
    ],
  },
  {
    id: 4,
    title: "Car Keys with Red Keychain",
    location: "Parking Lot B",
    date: "2024-12-15",
    category: "Keys",
    icon: "🔑",
    status: "active",
    description: "Toyota car keys with red keychain",
    contactEmail: "sarah@university.edu",
    contactPhone: "(555) 987-6543",
    comments: [],
  },
];

let foundItems = [
  {
    id: 5,
    title: "AirPods Pro",
    location: "Cafeteria",
    date: "2024-12-19",
    category: "Electronics",
    icon: "🎧",
    status: "active",
    description: "White AirPods Pro in charging case",
    contactEmail: "admin@university.edu",
    comments: [],
  },
  {
    id: 6,
    title: "Grey Hoodie",
    location: "Lecture Hall A",
    date: "2024-12-18",
    category: "Clothing",
    icon: "👕",
    status: "active",
    description: "Grey university hoodie, size M",
    contactEmail: "security@university.edu",
    comments: [
      {
        id: 1,
        author: "Student",
        text: "Is there a name tag inside?",
        time: "2024-12-19T11:00:00",
      },
    ],
  },
  {
    id: 7,
    title: "Student ID Card",
    location: "Main Entrance",
    date: "2024-12-17",
    category: "Documents",
    icon: "🆔",
    status: "claimed",
    description: "Student ID for Alex Johnson",
    contactEmail: "front.desk@university.edu",
    comments: [],
  },
  {
    id: 8,
    title: "Textbook - Chemistry 101",
    location: "Science Building",
    date: "2024-12-16",
    category: "Books",
    icon: "📚",
    status: "active",
    description: "Chemistry textbook with notes inside",
    contactEmail: "library@university.edu",
    comments: [],
  },
];

let activeTab = "lost";
let nextId = 9;
let selectedEmoji = "📱";
let uploadedImage = null;
let useEmoji = false;
let currentItemId = null;
let commentIdCounter = 100;

const lostTab = document.getElementById("lostTab");
const foundTab = document.getElementById("foundTab");
const itemsGrid = document.getElementById("itemsGrid");
const reportBtn = document.getElementById("reportBtn");
const reportModal = document.getElementById("reportModal");
const closeModal = document.getElementById("closeModal");
const submitBtn = document.getElementById("submitBtn");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const statusFilter = document.getElementById("statusFilter");
const emojiToggle = document.getElementById("emojiToggle");
const imageToggle = document.getElementById("imageToggle");
const emojiSection = document.getElementById("emojiSection");
const imageSection = document.getElementById("imageSection");
const uploadArea = document.getElementById("uploadArea");
const imageInput = document.getElementById("imageInput");
const emojiSelector = document.getElementById("emojiSelector");
const detailsModal = document.getElementById("detailsModal");
const closeDetailsModal = document.getElementById("closeDetailsModal");
const detailsContent = document.getElementById("detailsContent");
const itemTypeSelect = document.getElementById("itemType");
const emailRequired = document.getElementById("emailRequired");
const themeToggle = document.getElementById("themeToggle");
const loadingOverlay = document.getElementById("loadingOverlay");
const toastContainer = document.getElementById("toastContainer");
const imageZoomModal = document.getElementById("imageZoomModal");
const zoomedImage = document.getElementById("zoomedImage");

// Toast Notification System
function showToast(message, type = "info") {
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



// Image Zoom
function openImageZoom(imageSrc) {
  zoomedImage.src = imageSrc;
  imageZoomModal.classList.add("active");
}

function closeImageZoom() {
  imageZoomModal.classList.remove("active");
}

imageZoomModal.addEventListener("click", closeImageZoom);
imageZoomModal
  .querySelector(".zoom-close-btn")
  .addEventListener("click", function (e) {
    e.stopPropagation();
    closeImageZoom();
  });

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode", themeToggle.checked);
  localStorage.setItem(
    "darkMode",
    themeToggle.checked ? "enabled" : "disabled"
  );
}

// Load saved preference
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  themeToggle.checked = true;
}

// Listen to checkbox changes
themeToggle.addEventListener("change", toggleDarkMode);

function getTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return diffDays + " days ago";
  return dateStr;
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

function renderItems() {

  setTimeout(function () {
    const items = activeTab === "lost" ? lostItems : foundItems;
    const query = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const status = statusFilter.value;
    const sort = sortFilter.value;

    let filteredItems = items.filter(function (item) {
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query));
      const matchesCategory = !category || item.category === category;
      const matchesStatus = status === "all" || item.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (sort === "newest") {
      filteredItems.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
    } else {
      filteredItems.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
      });
    }

    if (filteredItems.length === 0) {
      itemsGrid.innerHTML =
        '<div class="no-items">No items found matching your filters.</div>';
      return;
    }

    itemsGrid.innerHTML = filteredItems
      .map(function (item) {
        const iconHtml = item.imageUrl
          ? '<img src="' +
            item.imageUrl +
            '" alt="' +
            item.title +
            '" class="zoomable-image">'
          : item.icon;

        const statusBadge =
          item.status === "claimed"
            ? '<span class="status-badge claimed">Claimed</span>'
            : '<span class="status-badge">Active</span>';

        return (
          '<div class="item-card ' +
          (item.status === "claimed" ? "claimed" : "") +
          '" data-id="' +
          item.id +
          '">' +
          statusBadge +
          '<div class="item-content">' +
          '<div class="item-icon">' +
          iconHtml +
          "</div>" +
          '<div class="item-details">' +
          "<h3>" +
          item.title +
          "</h3>" +
          '<div class="item-info">' +
          '<div class="info-row">' +
          '<svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>' +
          "</svg>" +
          item.location +
          "</div>" +
          '<div class="info-row">' +
          '<svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
          '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>' +
          '<line x1="16" y1="2" x2="16" y2="6"></line>' +
          '<line x1="8" y1="2" x2="8" y2="6"></line>' +
          '<line x1="3" y1="10" x2="21" y2="10"></line>' +
          "</svg>" +
          getTimeAgo(item.date) +
          "</div>" +
          '<div class="info-row">' +
          '<svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>' +
          "</svg>" +
          item.category +
          "</div>" +
          "</div>" +
          "</div>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    document.querySelectorAll(".item-card").forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.classList.contains("zoomable-image")) {
          e.stopPropagation();
          openImageZoom(e.target.src);
        } else {
          const itemId = parseInt(this.getAttribute("data-id"));
          showItemDetails(itemId);
        }
      });
    });

  }, 300);
}

function showItemDetails(itemId) {
  const allItems = lostItems.concat(foundItems);
  const item = allItems.find(function (i) {
    return i.id === itemId;
  });

  if (!item) return;
  currentItemId = itemId;

  const iconHtml = item.imageUrl
    ? '<img src="' +
      item.imageUrl +
      '" alt="' +
      item.title +
      '" class="zoomable-image" onclick="event.stopPropagation(); openImageZoom(\'' +
      item.imageUrl +
      "')\">"
    : '<div class="detail-icon-large-emoji">' + item.icon + "</div>";

  const statusColor = item.status === "claimed" ? "#64748b" : "#22c55e";
  const statusText = item.status === "claimed" ? "Claimed" : "Active";

  detailsContent.innerHTML =
    '<div class="detail-icon-large">' +
    iconHtml +
    "</div>" +
    '<h2 style="text-align: center; margin-bottom: 8px;">' +
    item.title +
    "</h2>" +
    '<p style="text-align: center; color: ' +
    statusColor +
    '; font-weight: 600; margin-bottom: 24px;">' +
    statusText +
    "</p>" +
    '<div class="detail-row">' +
    '<div class="detail-label">Category</div>' +
    '<div class="detail-value">' +
    item.category +
    "</div>" +
    "</div>" +
    '<div class="detail-row">' +
    '<div class="detail-label">Location</div>' +
    '<div class="detail-value">' +
    item.location +
    "</div>" +
    "</div>" +
    '<div class="detail-row">' +
    '<div class="detail-label">Date</div>' +
    '<div class="detail-value">' +
    getTimeAgo(item.date) +
    " (" +
    item.date +
    ")</div>" +
    "</div>" +
    (item.description
      ? '<div class="detail-row">' +
        '<div class="detail-label">Description</div>' +
        '<div class="detail-value">' +
        item.description +
        "</div>" +
        "</div>"
      : "") +
    (item.contactEmail
      ? '<div class="detail-row">' +
        '<div class="detail-label">Contact Email</div>' +
        '<div class="detail-value">' +
        item.contactEmail +
        "</div>" +
        "</div>"
      : "") +
    (item.contactPhone
      ? '<div class="detail-row">' +
        '<div class="detail-label">Contact Phone</div>' +
        '<div class="detail-value">' +
        item.contactPhone +
        "</div>" +
        "</div>"
      : "") +
    '<div class="action-buttons">' +
    (item.status === "active"
      ? '<button class="btn-submit" onclick="markAsClaimed(' +
        item.id +
        ')">Mark as Claimed</button>'
      : '<button class="btn-secondary" onclick="markAsActive(' +
        item.id +
        ')">Reactivate</button>') +
    "</div>" +
    '<div class="comments-section">' +
    '<div class="comments-header">Comments (' +
    item.comments.length +
    ")</div>" +
    '<div class="comment-input-wrapper">' +
    '<input type="text" class="comment-input" id="commentInput" placeholder="Add a comment...">' +
    '<input type="text" class="comment-name-input" id="commentAuthor" placeholder="Your name">' +
    '<button class="btn-comment" onclick="submitComment()">Post</button>' +
    "</div>" +
    renderComments(item) +
    "</div>";

  detailsModal.classList.add("active");
}

function renderComments(item) {
  if (!item.comments || item.comments.length === 0) {
    return '<div class="no-comments">No comments yet. Be the first to comment!</div>';
  }

  return (
    '<div class="comments-list">' +
    item.comments
      .map(function (comment) {
        return (
          '<div class="comment-item">' +
          '<div class="comment-header">' +
          '<span class="comment-author">' +
          comment.author +
          "</span>" +
          '<span class="comment-time">' +
          formatCommentTime(comment.time) +
          "</span>" +
          "</div>" +
          '<div class="comment-text">' +
          comment.text +
          "</div>" +
          "</div>"
        );
      })
      .join("") +
    "</div>"
  );
}

function submitComment() {
  const commentText = document.getElementById("commentInput").value.trim();
  const authorName =
    document.getElementById("commentAuthor").value.trim() || "Anonymous";

  if (!commentText) {
    showToast("Please enter a comment!", "error");
    return;
  }

  const allItems = lostItems.concat(foundItems);
  const item = allItems.find(function (i) {
    return i.id === currentItemId;
  });

  if (!item) return;

  if (!item.comments) {
    item.comments = [];
  }

  const newComment = {
    id: commentIdCounter++,
    author: authorName,
    text: commentText,
    time: new Date().toISOString(),
  };

  item.comments.push(newComment);

  lostItems = lostItems.map(function (i) {
    return i.id === currentItemId ? item : i;
  });
  foundItems = foundItems.map(function (i) {
    return i.id === currentItemId ? item : i;
  });

  showItemDetails(currentItemId);
  showToast("Comment posted successfully!", "success");
}

function markAsClaimed(itemId) {
  lostItems.forEach(function (item) {
    if (item.id === itemId) item.status = "claimed";
  });
  foundItems.forEach(function (item) {
    if (item.id === itemId) item.status = "claimed";
  });
  detailsModal.classList.remove("active");
  renderItems();
  showToast("Item marked as claimed!", "success");
}

function markAsActive(itemId) {
  lostItems.forEach(function (item) {
    if (item.id === itemId) item.status = "active";
  });
  foundItems.forEach(function (item) {
    if (item.id === itemId) item.status = "active";
  });
  detailsModal.classList.remove("active");
  renderItems();
  showToast("Item reactivated!", "success");
}

lostTab.addEventListener("click", function () {
  activeTab = "lost";
  lostTab.classList.add("active");
  foundTab.classList.remove("active");
  renderItems();
});

foundTab.addEventListener("click", function () {
  activeTab = "found";
  foundTab.classList.add("active");
  lostTab.classList.remove("active");
  renderItems();
});

reportBtn.addEventListener("click", function () {
  reportModal.classList.add("active");
  selectedEmoji = "📱";
  uploadedImage = null;
  useEmoji = false;
  imageToggle.classList.add("active");
  emojiToggle.classList.remove("active");
  imageSection.classList.remove("hidden");
  emojiSection.classList.add("hidden");
  uploadArea.classList.remove("has-image");
  uploadArea.innerHTML =
    '<p style="color: #64748b; margin-bottom: 8px;">Click to upload or drag and drop</p>' +
    '<p style="color: #94a3b8; font-size: 12px;">PNG, JPG, GIF up to 5MB</p>';
  emailRequired.textContent = "*";
});

closeModal.addEventListener("click", function () {
  reportModal.classList.remove("active");
});

closeDetailsModal.addEventListener("click", function () {
  detailsModal.classList.remove("active");
});

emojiToggle.addEventListener("click", function () {
  useEmoji = true;
  emojiToggle.classList.add("active");
  imageToggle.classList.remove("active");
  emojiSection.classList.remove("hidden");
  imageSection.classList.add("hidden");
});

imageToggle.addEventListener("click", function () {
  useEmoji = false;
  imageToggle.classList.add("active");
  emojiToggle.classList.remove("active");
  imageSection.classList.remove("hidden");
  emojiSection.classList.add("hidden");
});

itemTypeSelect.addEventListener("change", function () {
  if (this.value === "Found") {
    emailRequired.textContent = "(Optional)";
  } else {
    emailRequired.textContent = "*";
  }
});

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

uploadArea.addEventListener("click", function () {
  imageInput.click();
});

imageInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (event) {
      uploadedImage = event.target.result;
      uploadArea.classList.add("has-image");
      uploadArea.innerHTML =
        '<img src="' + uploadedImage + '" class="preview-image" alt="Preview">';
    };
    reader.readAsDataURL(file);
  }
});

reportModal.addEventListener("click", function (e) {
  if (e.target === reportModal) {
    reportModal.classList.remove("active");
  }
});

detailsModal.addEventListener("click", function (e) {
  if (e.target === detailsModal) {
    detailsModal.classList.remove("active");
  }
});

submitBtn.addEventListener("click", function () {
  const itemType = document.getElementById("itemType").value;
  const itemName = document.getElementById("itemName").value;
  const itemLocation = document.getElementById("itemLocation").value;
  const itemCategory = document.getElementById("itemCategory").value;
  const itemDescription = document.getElementById("itemDescription").value;
  const contactEmail = document.getElementById("contactEmail").value;
  const contactPhone = document.getElementById("contactPhone").value;

  if (!itemName || !itemLocation) {
    showToast("Please fill in Item Name and Location!", "error");
    return;
  }

  if (itemType === "Lost" && !contactEmail) {
    showToast("Contact Email is required for lost items!", "error");
    return;
  }

  if (!useEmoji && !uploadedImage) {
    showToast("Please upload an image or switch to emoji!", "error");
    return;
  }

  setTimeout(function () {
    const categoryIcons = {
      Electronics: "📱",
      "Personal Items": "🎒",
      Clothing: "👕",
      Accessories: "🧴",
      Documents: "🆔",
      Keys: "🔑",
      Books: "📚",
    };

    const today = new Date();
    const dateStr =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    const newItem = {
      id: nextId++,
      title: itemName,
      location: itemLocation,
      date: dateStr,
      category: itemCategory,
      icon: useEmoji ? selectedEmoji : categoryIcons[itemCategory] || "📦",
      imageUrl: useEmoji ? null : uploadedImage,
      status: "active",
      description: itemDescription,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone,
      comments: [],
    };

    if (itemType === "Lost") {
      lostItems.unshift(newItem);
      activeTab = "lost";
      lostTab.classList.add("active");
      foundTab.classList.remove("active");
    } else {
      foundItems.unshift(newItem);
      activeTab = "found";
      foundTab.classList.add("active");
      lostTab.classList.remove("active");
    }

    document.getElementById("itemName").value = "";
    document.getElementById("itemLocation").value = "";
    document.getElementById("itemDescription").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactPhone").value = "";

    reportModal.classList.remove("active");
    renderItems();
    showToast("Item reported successfully!", "success");
  }, 800);
});

searchInput.addEventListener("input", function () {
  renderItems();
});

categoryFilter.addEventListener("change", function () {
  renderItems();
});

sortFilter.addEventListener("change", function () {
  renderItems();
});

statusFilter.addEventListener("change", function () {
  renderItems();
});

renderItems();
