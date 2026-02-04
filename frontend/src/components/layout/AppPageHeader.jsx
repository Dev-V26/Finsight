import React from "react";
import PageHeader from "./PageHeader";

// Kept for backward compatibility: pages still import AppPageHeader.
// This component now only handles presentation (navigation moved to AppShell).
export default function AppPageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
    </div>
  );
}
