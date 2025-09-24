import * as React from "react";
import Bull from '../assets/bull.jpeg';

const APP_HEADER_H = "56px";

export default function AppHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 w-full bg-[#0B1320]/95 backdrop-blur"
      style={{ height: APP_HEADER_H, ["--app-header-h"]: APP_HEADER_H }}
    >
        <div className="flex h-full w-full items-center justify-center px-4">
          <a href="#/home" className="group flex items-center gap-2">
            <img src={Bull} alt="MacroDash Logo" className="h-7 w-7 shrink-0" />
            <span className="text-lg font-semibold tracking-tight">
              MacroDash
            </span>
          </a>
        </div>
    </header>
  );
}
