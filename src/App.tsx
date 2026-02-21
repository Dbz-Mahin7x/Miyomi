import React, { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { SoftwarePage } from "./pages/SoftwarePage";
import { ExtensionsPage } from "./pages/ExtensionsPage";
import { GuidesPage } from "./pages/GuidesPage";
import { GuideDetailPage } from "./pages/GuideDetailPage";
import { FAQPage } from "./pages/FAQPage";
import { AboutPage } from "./pages/AboutPage";
import { AppDetailPage } from "./pages/AppDetailPage";
import { ExtensionDetailPage } from "./pages/ExtensionDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SearchPage } from "./pages/SearchPage";
import { ChristmasSnow } from './components/ChristmasSnow';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

function AppDetailPageWrapper({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const { appId } = useParams<{ appId: string }>();
  return (
    <AppDetailPage
      appId={appId || ""}
      onNavigate={onNavigate}
    />
  );
}

function ExtensionDetailPageWrapper({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const { extensionId } = useParams<{ extensionId: string }>();
  return (
    <ExtensionDetailPage
      extensionId={extensionId || ""}
      onNavigate={onNavigate}
    />
  );
}

function GuideDetailPageWrapper({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const { slug } = useParams<{ slug: string }>();
  return (
    <GuideDetailPage
      slug={slug || ""}
      onNavigate={onNavigate}
    />
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    const currentScrollY = window.scrollY;
    navigate(path, {
      state: {
        previousScrollPosition: currentScrollY,
        fromNavigation: true
      }
    });
    // Scroll to top for new pages  
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] flex flex-col">
      {/* <ChristmasSnow /> */}
      <Toaster position="top-center" />

      <Navbar onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-8 lg:px-[120px] pt-24 pb-12">
        <Routes location={location}>
          <Route
            path="/"
            element={<HomePage onNavigate={handleNavigate} />}
          />
          <Route
            path="/software"
            element={
              <SoftwarePage onNavigate={handleNavigate} />
            }
          />
          <Route
            path="/software/:appId"
            element={
              <AppDetailPageWrapper
                onNavigate={handleNavigate}
              />
            }
          />
          <Route
            path="/extensions"
            element={
              <ExtensionsPage onNavigate={handleNavigate} />
            }
          />
          <Route
            path="/extensions/:extensionId"
            element={
              <ExtensionDetailPageWrapper
                onNavigate={handleNavigate}
              />
            }
          />
          <Route
            path="/guides"
            element={<GuidesPage onNavigate={handleNavigate} />}
          />
          <Route
            path="/guides/:slug"
            element={
              <GuideDetailPageWrapper
                onNavigate={handleNavigate}
              />
            }
          />
          <Route
            path="/search"
            element={<SearchPage onNavigate={handleNavigate} />}
          />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Fallback for unknown routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Prevent flash by setting initial theme class before render
    const storedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches
      ? "dark"
      : "light";
    const initialTheme = storedTheme || systemTheme;

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initialTheme);
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}