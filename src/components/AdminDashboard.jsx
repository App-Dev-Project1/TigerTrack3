// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import tigerLogo from "../assets/tiger.png";
import { supabase } from '../supabaseClient';

// Import views
import DashboardView from './DashboardView';
import ItemsView from './ItemsView';
import SolvedView from './SolvedView';
import ArchiveView from './ArchiveView';
import DisputeView from './DisputeView';

// Helper function to convert military time to 12-hour format
const formatTimeTo12Hour = (timeString) => {
    if (!timeString) return '';
    try {
        const timeParts = timeString.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const period = hours >= 12 ? 'PM' : 'AM';
        const twelveHour = hours % 12 || 12;
        return `${twelveHour}:${minutes} ${period}`;
    } catch (error) {
        return timeString;
    }
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    const [lostItems, setLostItems] = useState([]);
    const [foundItems, setFoundItems] = useState([]);
    const [solvedItems, setSolvedItems] = useState([]);

    const [logoutPopup, setLogoutPopup] = useState(false);
    const [matchPopup, setMatchPopup] = useState({ open: false, itemName: "" });
    const [claimPopup, setClaimPopup] = useState({ open: false, itemName: "" });

    // Fetch all data
    const fetchAllData = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        
        try {
            // 1. Fetch Lost Items
            const { data: lostData, error: lostError } = await supabase
                .from('lost_items')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            
            if (lostError) throw lostError;

            const mappedLostItems = lostData.map(item => ({
                ...item,
                date: item.lost_date,
                time: formatTimeTo12Hour(item.lost_time), 
                email: item.contact_email,
                ownerName: item.owner_name,
                occupation: item.occupation,
                contactNumber: item.contact_number,
                description: item.description,
                // Ensure we have a timestamp for sorting
                sortTime: item.created_at || item.lost_date
            }));
            setLostItems(mappedLostItems);

            // 2. Fetch Found Items
            const { data: foundData, error: foundError } = await supabase
                .from('found_items')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (foundError) throw foundError;

            const mappedFoundItems = foundData.map(item => ({
                ...item,
                date: item.found_date,
                time: formatTimeTo12Hour(item.found_time), 
                photo: item.photo_url,
                email: item.contact_email,
                finderName: item.finder_name,
                occupation: item.occupation,
                contactNumber: item.contact_number,
                description: item.description,
                // Ensure we have a timestamp for sorting
                sortTime: item.created_at || item.found_date
            }));
            setFoundItems(mappedFoundItems);

            // 3. Fetch Solved Items
            const { data: solvedData, error: solvedError } = await supabase
                .from('solved_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (solvedError) throw solvedError;

            const mappedSolvedItems = solvedData.map(item => ({
                ...item,
                claimedBy: item.claimed_by_email,
                resolvedDate: item.resolved_date,
                lostId: item.lost_item_id,
                foundId: item.found_item_id,
                isClaimed: item.is_claimed,
                claimedDate: item.claimed_date,
                // Ensure we have a timestamp for sorting
                sortTime: item.created_at || item.resolved_date
            }));
            setSolvedItems(mappedSolvedItems);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, []);

    // Auth Listener & Real-time subscription
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/admin-login');
            } else {
                fetchAllData();
            }
        };
        checkUser();

        // Subscribe to changes in all tables to auto-refresh dashboard
        const changes = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public' }, () => {
                fetchAllData(true);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(changes);
        };
    }, [navigate, fetchAllData]);

    // Force refresh when tab changes
    useEffect(() => {
        if(activeTab === 'dashboard' || activeTab === 'items' || activeTab === 'solved') {
            fetchAllData(true);
        }
    }, [activeTab, fetchAllData]);

    const handleItemRestored = () => {
        fetchAllData(true);
    };

    // Actions
    const handleMatchConfirmed = async (resolvedItem) => {
        try {
            const { error: solvedError } = await supabase
                .from('solved_items')
                .insert([{
                    name: resolvedItem.name,
                    category: resolvedItem.category,
                    resolved_date: resolvedItem.resolvedDate,
                    claimed_by_email: resolvedItem.claimedBy,
                    lost_item_id: resolvedItem.lostId,
                    found_item_id: resolvedItem.foundId,
                    is_claimed: false,
                    lost_details: resolvedItem.lostDetails,
                    found_details: resolvedItem.foundDetails
                }]);

            if (solvedError) throw solvedError;

            await supabase.from('lost_items').update({ status: 'solved' }).eq('id', resolvedItem.lostId);
            await supabase.from('found_items').update({ status: 'solved' }).eq('id', resolvedItem.foundId);

            await fetchAllData(true);
            setMatchPopup({ open: true, itemName: resolvedItem.name || "Item" });
        } catch (error) {
            console.error("Error confirming match:", error);
        }
    };

    const handleMarkAsClaimed = async (itemId) => {
        try {
            const item = solvedItems.find(i => i.id === itemId);
            const { error } = await supabase
                .from('solved_items')
                .update({ is_claimed: true, claimed_date: new Date().toISOString().split('T')[0] })
                .eq('id', itemId);
            if (error) throw error;

            await fetchAllData(true);
            setClaimPopup({ open: true, itemName: item?.name || "Item" });
        } catch (error) {
            console.error("Error marking as claimed:", error);
        }
    };

    const handleDeleteLostItem = async (id) => {
        try {
            setLostItems(prevItems => prevItems.filter(item => item.id !== id));
            await fetchAllData(true);
        } catch (error) {
            await fetchAllData(true);
        }
    };

    const handleDeleteFoundItem = async (id) => {
        try {
            setFoundItems(prevItems => prevItems.filter(item => item.id !== id));
            await fetchAllData(true);
        } catch (error) {
            await fetchAllData(true);
        }
    };

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    // --- RECENT ACTIVITY LOGIC (Calculated Memo) ---
    const { stats, recentActivity } = useMemo(() => {
        const pendingCount = lostItems.length + foundItems.length;
        const resolvedCount = solvedItems.length;
        const totalCount = pendingCount + resolvedCount;

        // Combine all lists into a unified activity feed
        const allActivities = [
            ...lostItems.map(item => ({ 
                type: 'lost', 
                label: 'Lost Report', 
                name: item.name, 
                // Use the sortTime we prepared earlier
                timestamp: item.sortTime,
                displayDate: item.date,
                id: item.id 
            })),
            ...foundItems.map(item => ({ 
                type: 'found', 
                label: 'Found Item', 
                name: item.name, 
                timestamp: item.sortTime,
                displayDate: item.date,
                id: item.id 
            })),
            ...solvedItems.map(item => ({ 
                type: 'solved', 
                label: 'Item Resolved', 
                name: item.name, 
                timestamp: item.sortTime,
                displayDate: item.resolvedDate, 
                id: item.id 
            }))
        ];

        // Sort by timestamp descending (Newest first)
        const sorted = allActivities.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA;
        });

        // Take top 5
        const recent = sorted.slice(0, 5).map(item => {
            // Format timestamp for display (e.g., "Oct 12, 10:30 AM" or just Date)
            let formattedDate = item.displayDate;
            try {
                if (item.timestamp) {
                    const dateObj = new Date(item.timestamp);
                    if (!isNaN(dateObj)) {
                        formattedDate = dateObj.toLocaleDateString('en-US', {
                            month: 'short', 
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                        });
                    }
                }
            } catch (e) { /* fallback to original date string */ }

            return {
                ...item,
                displayDate: formattedDate
            };
        });

        return {
            stats: { totalItems: totalCount, pending: pendingCount, resolved: resolvedCount },
            recentActivity: recent
        };
    }, [lostItems, foundItems, solvedItems]);

    const renderContent = () => {
        if (loading && activeTab === 'dashboard') {
            return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>Loading data...</div>;
        }

        switch (activeTab) {
            case "dashboard":
                return <DashboardView stats={stats} recentActivity={recentActivity} />;
            case "items":
                return <ItemsView initialLostItems={lostItems} initialFoundItems={foundItems} onMatchConfirmed={handleMatchConfirmed} onDeleteLostItem={handleDeleteLostItem} onDeleteFoundItem={handleDeleteFoundItem} />;
            case "solved":
                return <SolvedView allResolvedItems={solvedItems} onMarkAsClaimed={handleMarkAsClaimed} />;
            case "archive":
                return <ArchiveView onRestore={handleItemRestored} />;
            case "dispute":
                return <DisputeView />;
            default:
                return <DashboardView stats={stats} recentActivity={recentActivity} />;
        }
    };

    return (
        <>
            {/* LOGOUT POPUP */}
            {logoutPopup && (
                <div className="logout-overlay">
                    <div className="logout-modal">
                        <h2>Logout Confirmation</h2>
                        <p>Are you sure you want to logout?</p>
                        <div className="logout-actions">
                            <button className="cancel-btn" onClick={() => setLogoutPopup(false)}>Cancel</button>
                            <button className="confirm-btn" onClick={confirmLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMATION POPUPS */}
            {(matchPopup.open || claimPopup.open) && (
                <div className="match-overlay">
                    <div className="claim-modal">
                        <div className="claim-icon">✓</div>
                        <h2>{matchPopup.open ? "Match Confirmed" : "Item Claimed"}</h2>
                        <p>Item <strong>{matchPopup.open ? matchPopup.itemName : claimPopup.itemName}</strong> updated successfully.</p>
                        <button className="claim-close-btn" onClick={() => {
                            setMatchPopup({ open: false, itemName: "" });
                            setClaimPopup({ open: false, itemName: "" });
                        }}>Continue</button>
                    </div>
                </div>
            )}

            <div className="admin-container">
                <div className="sidebar">
                    <img src={tigerLogo} alt="TigerTrack Logo" className="tiger-logo" />
                    <div className="sidebar-logo"><h4>TigerTrack</h4><p>Admin Board</p></div>
                    <nav className="sidebar-nav">
                        <NavItem icon="📊" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <NavItem icon="📦" label="Items" active={activeTab === 'items'} onClick={() => setActiveTab('items')} />
                        <NavItem icon="🛠️" label="Solved/Claimed" active={activeTab === 'solved'} onClick={() => setActiveTab('solved')} />
                        <NavItem icon="🗃️" label="Archive" active={activeTab === 'archive'} onClick={() => setActiveTab('archive')} />
                        <NavItem icon="⚠️" label="Dispute" active={activeTab === 'dispute'} onClick={() => setActiveTab('dispute')} />
                    </nav>
                    <div className="sidebar-logout">
                        <button className="logout-btn" onClick={() => setLogoutPopup(true)}>➜ Logout</button>
                    </div>
                </div>
                <div className="main-content">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
        <span className="nav-item-icon">{icon}</span><span>{label}</span>
    </button>
);

export default AdminDashboard;