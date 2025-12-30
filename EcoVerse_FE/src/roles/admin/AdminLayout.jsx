import React from 'react';

/**
 * AdminLayout - Layout chính cho Admin Role
 * Bao gồm: Sidebar navigation, Header, Footer
 */
export function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        {/* Header content */}
      </header>

      <div className="admin-container">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {/* Navigation menu */}
        </aside>

        {/* Main content */}
        <main className="admin-main">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="admin-footer">
        {/* Footer content */}
      </footer>
    </div>
  );
}

export default AdminLayout;
