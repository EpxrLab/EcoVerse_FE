import React from 'react';

/**
 * StudentLayout - Layout chính cho Student Role
 * Bao gồm: Sidebar navigation, Header, Footer
 */
export function StudentLayout({ children }) {
  return (
    <div className="student-layout">
      {/* Header */}
      <header className="student-header">
        {/* Header content */}
      </header>

      <div className="student-container">
        {/* Sidebar */}
        <aside className="student-sidebar">
          {/* Navigation menu */}
        </aside>

        {/* Main content */}
        <main className="student-main">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="student-footer">
        {/* Footer content */}
      </footer>
    </div>
  );
}

export default StudentLayout;
