import React from 'react';

/**
 * SchoolLayout - Layout chính cho School Role
 * Bao gồm: Sidebar navigation, Header, Footer
 */
export function SchoolLayout({ children }) {
  return (
    <div className="school-layout">
      {/* Header */}
      <header className="school-header">
        {/* Header content */}
      </header>

      <div className="school-container">
        {/* Sidebar */}
        <aside className="school-sidebar">
          {/* Navigation menu */}
        </aside>

        {/* Main content */}
        <main className="school-main">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="school-footer">
        {/* Footer content */}
      </footer>
    </div>
  );
}

export default SchoolLayout;
