// app/settings/page.js
"use client";

import React, { useState } from 'react';
import { AppContext } from '../../lib/appContext'; // Adjust path as needed
import { ConfirmationModal } from '../components/ConfirmationModal'; // Re-use modal

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export default function SettingsPage() {
  const { isAuthenticated, userProfile, user: stackAuthUser, isLoading } = React.useContext(AppContext);
  const [emailNotifications, setEmailNotifications] = useState(userProfile?.email_notifications || false);
  const [smsNotifications, setSmsNotifications] = useState(userProfile?.sms_notifications || false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationAction, setConfirmationAction] = useState(() => () => {});

  // Update local state when userProfile changes (e.g., after initial load or profile update)
  React.useEffect(() => {
    if (userProfile) {
      setEmailNotifications(userProfile.email_notifications || false);
      setSmsNotifications(userProfile.sms_notifications || false);
    }
  }, [userProfile]);


  const handleExportData = () => {
    setConfirmationMessage("Are you sure you want to export your data? This action cannot be undone.");
    setConfirmationAction(() => () => {
      console.log("Exporting data...");
      // Placeholder for actual data export logic
      // In a real app, this would trigger a backend function to generate and provide the export.
      alert("Data export initiated (placeholder). Check console for details.");
      setShowConfirmation(false);
    });
    setShowConfirmation(true);
  };

  const handleSaveNotificationPreferences = async () => {
    if (!isAuthenticated || !userProfile?.id) {
      alert("You must be logged in to save preferences.");
      return;
    }
    try {
      // Assuming you have an API endpoint to update user profile settings
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/update-user-profile`, {
        method: 'POST', // Or PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          email_notifications: emailNotifications,
          sms_notifications: smsNotifications,
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      alert("Notification preferences saved successfully!");
      // You might want to trigger a re-fetch of userProfile here if it's not automatically updated
      // fetchOrCreateUserProfile(); // If this function is available via context or passed down
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
      alert("Failed to save preferences: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="text-xl font-semibold text-gray-700">Loading settings...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-700">You must be logged in to view your settings.</p>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 rounded-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Profile Information</h3>
                <p className="text-gray-600">Review your personal details.</p>
                <div className="mt-3">
                    <p className="text-gray-700">Name: {userProfile?.name || stackAuthUser?.displayName || stackAuthUser?.email || 'N/A'}</p>
                    <p className="text-gray-700">Email: {userProfile?.email || stackAuthUser?.email || 'N/A'}</p>
                    <p className="text-gray-700">Role: {userProfile?.role || 'N/A'}</p>
                </div>
                <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200">
                    Edit Profile (Placeholder)
                </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 rounded-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Notification Preferences</h3>
                <p className="text-gray-600">Configure how you receive alerts for new activity.</p>
                <div className="mt-3 flex items-center">
                    <input type="checkbox" id="email-notifications" className="mr-2" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
                    <label htmlFor="email-notifications" className="text-gray-700">Email notifications</label>
                </div>
                <div className="mt-2 flex items-center">
                    <input type="checkbox" id="sms-notifications" className="mr-2" checked={smsNotifications} onChange={(e) => setSmsNotifications(e.target.checked)} />
                    <label htmlFor="sms-notifications" className="text-gray-700">SMS notifications (coming soon)</label>
                </div>
                <button onClick={handleSaveNotificationPreferences} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200">
                    Save Preferences
                </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 rounded-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Data Management</h3>
                <p className="text-gray-600">Review and manage your data.</p>
                <button onClick={handleExportData} className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200">
                    Export My Data
                </button>
            </div>
        </div>
        {showConfirmation && (
            <ConfirmationModal
                message={confirmationMessage}
                onConfirm={confirmationAction}
                onCancel={() => setShowConfirmation(false)}
            />
        )}
    </section>
  );
}
