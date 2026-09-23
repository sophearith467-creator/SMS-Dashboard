import React from 'react';
import { Navigate } from 'react-router-dom';
import { SmartphoneIcon, LogOutIcon, ExternalLinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function MobileOnly() {
  const { user, isAuthenticated, signOut } = useAuth();

  // If user signed out → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Try to open the Flutter app via deep link.
  // Change "onemore://" later when you have a real scheme.
  const openMobileApp = () => {
    const deepLink = 'onemore://'; // ← change this later
    window.location.href = deepLink;

    // Optional: after a short delay, you could redirect to store
    // setTimeout(() => {
    //   window.location.href = 'https://play.google.com/store/apps/details?id=com.onemore.mission';
    // }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <SmartphoneIcon size={28} />
        </div>

        <h1 className="text-xl font-semibold text-fg">
          Please use the mobile app
        </h1>

        <p className="mt-2 text-sm text-fg-muted">
          The account <strong>{user?.email}</strong> is for staff members and can only be used in the OneMore Mission mobile app.
        </p>

        <p className="mt-4 text-sm text-fg-muted">
          Open the app on your phone to continue. If you don’t have it yet, download it from the store.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button fullWidth onClick={openMobileApp} className="gap-2">
            <ExternalLinkIcon size={16} />
            Open Mobile App
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => signOut()}
            className="gap-2"
          >
            <LogOutIcon size={16} />
            Sign out
          </Button>
        </div>

        <p className="mt-6 text-xs text-fg-subtle">
          Don’t have the app yet?<br />
          Download it from the App Store or Google Play (links coming soon).
        </p>
      </div>
    </div>
  );
}
