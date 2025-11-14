// src/components/ArchiveView.jsx
import React, { useState, useEffect } from "react";
import "./ArchiveView.css";

// --- 1. HERE IS THE HARDCODED EXAMPLE DATA ---
const hardcodedArchivedItems = [
  {
    id: 9001,
    name: "Old Blue Umbrella",
    category: "Umbrellas",
    dateFound: "2024-01-10",
    archiveDate: "2025-01-10",
    archiveReason: "expired",
  },
  {
    id: 9002,
    name: "Cracked iPhone 8",
    category: "Electronics",
    dateFound: "2024-05-15",
    archiveDate: "2024-06-01",
    archiveReason: "removed",
  },
];
// -------------------------------------------

const ArchiveView = () => {
  // --- 2. STATES ARE UPDATED ---
  const [archivedItems, setArchivedItems] = useState(hardcodedArchivedItems);
  const [loading, setLoading] = useState(false); // Set to false, no API call
  const [filter, setFilter] = useState("all");
  // -----------------------------

  // --- 3. THE useEffect AND fetchArchivedItems ARE REMOVED ---
  // (No need to fetch data from an API)
  // -----------------------------------------------------

  const handleRestore = async (itemId) => {
    // This is just a simulation, it will remove the item from the list
    console.log("Restoring item:", itemId);
    alert("This is a demo. Restoring the item would remove it from this list.");
    setArchivedItems(archivedItems.filter((item) => item.id !== itemId));
    
    /* // TODO: When you implement the archive backend, the real code would be:
    try {
      // 1. Update the item's status in the database (e.g., set to 'pending')
      // 2. Remove it from the 'archived' table (or update an 'is_archived' flag)
      // 3. Re-fetch data or rely on the dashboard's realtime listener to update
    } catch (error) {
      console.error("Error restoring item:", error);
      alert("Error restoring item");
    }
    */
  };

  const filteredItems = archivedItems.filter((item) => {
    if (filter === "all") return true;
    if (filter === "expired") return item.archiveReason === "expired";
    if (filter === "removed") return item.archiveReason === "removed";
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="archive-header">
        <div className="archive-title-wrapper">
          <div className="archive-icon">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2>Archive</h2>
        </div>
        <p>View archived items</p>
      </div>

      {/* ===== FILTER TABS ===== */}
      <div className="filter-tabs">
        <button
          className={filter === "all" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "expired" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("expired")}
        >
          Expired
        </button>
        <button
          className={filter === "removed" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("removed")}
        >
          Removed
        </button>
      </div>

      {/* ===== MAIN CONTAINER ===== */}
      <div className="activity-card">
        {loading ? (
          <div className="activity-empty">
            <div className="loading-spinner"></div>
            <p className="empty-subtitle">Loading archived items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="activity-empty">
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#94a3b8" 
              strokeWidth="1.5"
              className="empty-icon"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <p className="empty-title">No archived items yet</p>
            <p className="empty-subtitle">
              Items unclaimed for 1 year will automatically appear here
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="archive-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Date Found</th>
                  <th>Archive Date</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td>{formatDate(item.dateFound)}</td>
                    <td>{formatDate(item.archiveDate)}</td>
                    <td>
                      <span className="reason-text">
                        {item.archiveReason === "expired"
                          ? "Unclaimed for 1 year"
                          : "Removed by admin"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="restore-btn"
                        onClick={() => handleRestore(item.id)}
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ArchiveView;