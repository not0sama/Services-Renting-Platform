import React from "react";
import Sidebar from "@/components/Sidebar";

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return <Sidebar>{children}</Sidebar>;
}
