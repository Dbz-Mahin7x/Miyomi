import React, { useState } from 'react';
import { ArrowLeft, Download, Copy, Github, Globe, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getExtensionById, getExtensionApps } from '../data';
import { AppGridCard } from '../components/AppGridCard';
import { ParticleBackground } from '../components/ParticleBackground';
import { useFeedbackState } from '../hooks/useFeedbackState';
import { FlagDisplay } from '../components/FlagDisplay';
import { useAccentColor } from '../hooks/useAccentColor';
import { LoveButton } from '../components/LoveButton';

interface ExtensionDetailPageProps {
  extensionId: string;
  onNavigate?: (path: string) => void;
}

export function ExtensionDetailPage({ extensionId, onNavigate }: ExtensionDetailPageProps) {
  const extension = getExtensionById(extensionId);
  const accentColor = useAccentColor({
    logoUrl: extension?.logoUrl,
    preferredColor: extension?.accentColor,
    defaultColor: 'var(--brand)',
  });
  const [logoError, setLogoError] = useState(false);
  const supportedApps = getExtensionApps(extensionId);
  const displayedApps = supportedApps.slice(0, 3);
  const hasMoreApps = supportedApps.length > displayedApps.length;
  const { isFeedbackOpen, handleToggle, handleClose } = useFeedbackState();
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile detection for different animation approach
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;


  const handleBackClick = () => {
    const scrollPos = location.state?.previousScrollPosition;

    if (onNavigate) {
      onNavigate('/extensions');
    } else {
      navigate('/extensions', {
        state: { previousScrollPosition: scrollPos }
      });
    }
  };

  if (!extension) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center py-16 sm:py-24">
          <div className="text-6xl sm:text-8xl mb-6 opacity-50">🔌</div>
          <h3 className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
            Extension not found
          </h3>
          <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] mb-6">
            The extension you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleBackClick}
            className="px-6 py-3 bg-[var(--brand)] hover:bg-[var(--brand-strong)] text-white rounded-xl transition-all font-['Inter',sans-serif]"
            style={{ fontWeight: 600 }}
          >
            Back to Extensions
          </button>
        </div>
      </motion.div>
    );
  }

  const copyToClipboard = (value: string, message = 'URL copied!') => {
    navigator.clipboard.writeText(value);
    toast.success(message);
  };

  const viewMoreContentType =
    extension.types.length === 0
      ? 'All'
      : extension.types.length > 1
        ? 'Multi'
        : extension.types[0];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderActionButtons = (layout: 'inline' | 'stack') => {
    const hasValidAutoUrl = extension.autoUrl && extension.autoUrl.trim() !== '';
    const hasValidManualUrl = extension.manualUrl && extension.manualUrl.trim() !== '';

    if (!hasValidAutoUrl && !hasValidManualUrl) {
      return null;
    }

    const baseButtonClass =
      "flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all font-['Inter',sans-serif]";
    const buildButtonClass = (variant: 'primary' | 'secondary') => {
      const palette =
        variant === 'primary'
          ? "bg-[var(--brand)] hover:bg-[var(--brand-strong)] text-white"
          : "bg-[var(--bg-elev-1)] hover:bg-[var(--chip-bg)] text-[var(--text-primary)]";
      return `${baseButtonClass} ${palette}`;
    };

    const installButton = (widthClass: string) => (
      <button
        onClick={() => window.open(extension.autoUrl, '_blank')}
        className={`${widthClass} ${buildButtonClass('primary')}`}
        style={{ fontWeight: 600 }}
      >
        <Download className="w-4 h-4" />
        Auto Install
      </button>
    );

    const copyButton = (widthClass: string) => (
      <button
        onClick={() => copyToClipboard(extension.manualUrl, 'Source URL copied to clipboard!')}
        className={`${widthClass} ${buildButtonClass('secondary')}`}
        style={{ fontWeight: 600 }}
      >
        <Copy className="w-4 h-4" />
        Copy URL
      </button>
    );

    if (layout === 'inline') {
      const hasOnlyOneButton = (hasValidAutoUrl && !hasValidManualUrl) || (!hasValidAutoUrl && hasValidManualUrl);
      const buttonContainerClass = hasOnlyOneButton
        ? 'flex gap-3 justify-center'
        : 'flex gap-3';
      const buttonWidthClass = hasOnlyOneButton
        ? 'max-w-[280px] w-full'
        : 'flex-1';

      return (
        <div className="flex flex-col gap-3">
          {(hasValidAutoUrl || hasValidManualUrl) && (
            <div className={buttonContainerClass}>
              {hasValidAutoUrl && installButton(buttonWidthClass)}
              {hasValidManualUrl && copyButton(buttonWidthClass)}
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            {extension.github && (
              <a
                href={extension.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[var(--bg-elev-1)] border border-[var(--divider)] rounded-xl hover:bg-[var(--chip-bg)] hover:border-[var(--brand)] transition-all text-[var(--text-secondary)] hover:text-[var(--brand)]"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {extension.website && (
              <a
                href={extension.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[var(--bg-elev-1)] border border-[var(--divider)] rounded-xl hover:bg-[var(--chip-bg)] hover:border-[var(--brand)] transition-all text-[var(--text-secondary)] hover:text-[var(--brand)]"
                title="Website"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      );
    }

    // Stacked layout for desktop sidebar
    return (
      <div className="flex w-full flex-col gap-3">
        {hasValidAutoUrl && installButton('w-full')}
        {hasValidManualUrl && copyButton('w-full')}
      </div>
    );
  };

  const renderDesktopQuickLinks = () => {
    const quickLinks = [
      extension.github && {
        href: extension.github,
        label: 'GitHub',
        description: 'Project repository',
        Icon: Github,
      },
      extension.website && {
        href: extension.website,
        label: 'Website',
        description: 'Official site',
        Icon: Globe,
      },
    ].filter(Boolean) as {
      href: string;
      label: string;
      description: string;
      Icon: typeof Github;
    }[];

    if (quickLinks.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-col gap-2">
        {quickLinks.map(({ href, label, description, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-[var(--divider)] bg-[var(--bg-elev-1)] px-4 py-3 text-left transition-all hover:border-[var(--brand)] hover:shadow-sm group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--chip-bg)] text-[var(--brand)] flex-shrink-0">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p
                className="font-['Inter',sans-serif] text-[var(--text-primary)]"
                style={{ fontWeight: 600, fontSize: '14px' }}
              >
                {label}
              </p>
              <p className="font-['Inter',sans-serif] text-xs text-[var(--text-secondary)]">{description}</p>
            </div>
            <span className="text-lg text-[var(--divider)] group-hover:text-[var(--brand)] transition-colors">&rarr;</span>
          </a>
        ))}
      </div>
    );
  };

  const inlineActions = renderActionButtons('inline');
  const stackedActions = renderActionButtons('stack');
  const desktopQuickLinks = renderDesktopQuickLinks();
  const showDesktopSidebar = Boolean(stackedActions) || Boolean(desktopQuickLinks);
  const headerLayoutClasses = showDesktopSidebar
    ? 'lg:grid lg:grid-cols-[auto,minmax(0,1fr),280px]'
    : 'lg:grid lg:grid-cols-[auto,minmax(0,1fr)]';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto"
    >
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={handleBackClick}
        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors mb-6 font-['Inter',sans-serif]"
        style={{ fontWeight: 500 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Extensions
      </motion.button>

      {/* Header Section */}
      <motion.div
        layoutId={!isMobile ? `extension-card-${extensionId}` : undefined}
        initial={isMobile ? { opacity: 0, x: 20 } : undefined}
        animate={isMobile ? { opacity: 1, x: 0 } : undefined}
        exit={isMobile ? { opacity: 0, x: -20 } : undefined}
        transition={isMobile ? { duration: 0.2, ease: "easeOut" } : {
          type: "spring",
          stiffness: 260,
          damping: 35,
          mass: 0.8
        }}
        className="relative bg-[var(--bg-surface)] border border-[var(--divider)] rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 overflow-hidden"
        style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)' }}
      >
        <ParticleBackground />
        <div
          className={`relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center lg:gap-6 lg:items-start ${headerLayoutClasses}`}
        >
          {/* Extension Logo / Fallback */}
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl flex-shrink-0 sm:mx-0 sm:h-24 sm:w-24 lg:h-28 lg:w-28 overflow-hidden bg-[var(--chip-bg)]"
            aria-label={`${extension.name} logo`}
          >
            {(!extension.logoUrl || logoError) ? (
              <div
                className="w-full h-full flex items-center justify-center text-white"
                style={{ backgroundColor: accentColor, fontWeight: 600, fontSize: '32px' }}
              >
                {extension.name.charAt(0)}
              </div>
            ) : (
              <img
                src={extension.logoUrl}
                alt={`${extension.name} logo`}
                className="w-full h-full object-cover"
                onError={() => setLogoError(true)}
              />
            )}
          </div>

          {/* Extension Info */}
          <div className="w-full min-w-0 flex-1 text-center sm:text-left">
            {/* Extension Name with Flag */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start mb-2">
              <h1
                className="text-[var(--text-primary)] font-['Poppins',sans-serif]"
                style={{ fontSize: 'clamp(24px, 5vw, 32px)', lineHeight: '1.2', fontWeight: 700 }}
              >
                {extension.name}
              </h1>
              {extension.region && (
                <span className="flex items-center">
                  <FlagDisplay region={extension.region} size="medium" />
                </span>
              )}
              <div className="ml-1">
                <LoveButton itemId={extension.id} />
              </div>
            </div>

            {extension.types.length > 0 && (
              <div className="mb-4 flex flex-col items-center gap-2 sm:items-start">
                <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] mb-4" style={{ fontSize: '16px' }}>
                  {extension.info}
                </p>
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  {extension.types.map((type, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-[var(--chip-bg)] px-3 py-1 font-['Inter',sans-serif] text-[var(--text-primary)]"
                      style={{ fontWeight: 600, fontSize: '13px' }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            {extension.lastUpdated && (
              <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--text-secondary)] sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Last Updated: {formatDate(extension.lastUpdated)}
                </span>
              </div>
            )}

            {/* Action Buttons (Mobile) */}
            <div className="lg:hidden">{inlineActions}</div>
          </div>

          {/* Desktop Sidebar */}
          {showDesktopSidebar && (
            <div className="hidden lg:flex lg:w-[280px] lg:flex-col lg:items-stretch lg:gap-3">
              {stackedActions && (
                <div className="rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] p-4">
                  <p
                    className="mb-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]"
                    style={{ fontWeight: 600, letterSpacing: '0.12em' }}
                  >
                    Actions
                  </p>
                  {stackedActions}
                </div>
              )}
              {desktopQuickLinks && (
                <div className="rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] p-4">
                  <p
                    className="mb-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]"
                    style={{ fontWeight: 600, letterSpacing: '0.12em' }}
                  >
                    Quick Links
                  </p>
                  {desktopQuickLinks}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Overview Section - Conditional */}
      {extension.overview && (
        <div className="mb-6 sm:mb-8">
          <h2
            className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-4"
            style={{ fontSize: '24px', fontWeight: 600 }}
          >
            Overview
          </h2>
          <div className="bg-[var(--bg-surface)] border border-[var(--divider)] rounded-2xl p-6" style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)' }}>
            <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] leading-relaxed" style={{ fontSize: '15px' }}>
              {extension.overview}
            </p>
          </div>
        </div>
      )}

      {/* Supported Apps Section */}
      {supportedApps.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2
            className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-4"
            style={{ fontSize: '24px', fontWeight: 600 }}
          >
            Compatible Apps
          </h2>
          <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] mb-4" style={{ fontSize: '15px' }}>
            This source is compatible with the following apps:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayedApps.map((app) => (
              <AppGridCard
                key={app.id}
                appId={app.id}
                name={app.name}
                description={app.description}
                tags={app.contentTypes as any}
                platforms={app.platforms as any}
                iconColor={app.accentColor || app.iconColor}
                logoUrl={app.logoUrl}
                rating={app.rating}
                downloads={app.downloads}
                forkOf={app.forkOf}
                upstreamUrl={app.upstreamUrl}
                onClick={() => onNavigate?.(`/software/${app.id}`)}
              />
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={() =>
                onNavigate?.(
                  `/software?content=${encodeURIComponent(viewMoreContentType)}`
                )
              }
              className="px-4 py-2 bg-[var(--chip-bg)] hover:bg-[var(--brand)] text-[var(--brand)] hover:text-white rounded-xl transition-all font-['Inter',sans-serif]"
              style={{ fontWeight: 600 }}
            >
              {hasMoreApps ? 'See all supported apps' : 'Browse more apps'}
            </button>
          </div>
        </div>
      )}


      {/* Support Information */}
      <div className="mb-6 sm:mb-8">
        <h2
          className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-4"
          style={{ fontSize: '24px', fontWeight: 600 }}
        >
          Support Information
        </h2>
        <div className="bg-[var(--bg-surface)] border border-[var(--divider)] rounded-2xl p-6" style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)' }}>
          {extension.info && (
            <div className="mb-4 pb-4 border-b border-[var(--divider)]">
              <p className="text-[var(--text-secondary)] font-['Inter',sans-serif]" style={{ fontSize: '15px' }}>
                {extension.info}
              </p>
            </div>
          )}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--chip-bg)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">📦</span>
              </div>
              <div>
                <div className="text-[var(--text-primary)] font-['Inter',sans-serif] mb-1" style={{ fontWeight: 600, fontSize: '14px' }}>
                  Installation Method
                </div>
                <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] text-sm">
                  Use the Auto Install button for automatic setup, or copy the manual URL for manual configuration in your app.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--chip-bg)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">🔄</span>
              </div>
              <div>
                <div className="text-[var(--text-primary)] font-['Inter',sans-serif] mb-1" style={{ fontWeight: 600, fontSize: '14px' }}>
                  Updates
                </div >
                <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] text-sm">
                  Extensions are automatically updated by your app when new versions are available from this source.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Links */}
      {/* <div className="bg-[var(--bg-elev-1)] rounded-2xl p-6 text-center">
        <h3 className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
          Need Help?
        </h3>
        <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] text-sm mb-4">
          Visit our community for support, guides, and troubleshooting assistance.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigate?.('/guides')}
            className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--divider)] hover:border-[var(--brand)] text-[var(--text-primary)] rounded-xl transition-all font-['Inter',sans-serif] text-sm"
            style={{ fontWeight: 500 }}
          >
            View Guides
          </button>
          <button
            onClick={() => onNavigate?.('/faq')}
            className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--divider)] hover:border-[var(--brand)] text-[var(--text-primary)] rounded-xl transition-all font-['Inter',sans-serif] text-sm"
            style={{ fontWeight: 500 }}
          >
            FAQ
          </button>
        </div>
      </div> */}
    </motion.div>
  );
}
