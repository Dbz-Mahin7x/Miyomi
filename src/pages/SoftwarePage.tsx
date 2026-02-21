import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { FilterDropdown } from '../components/FilterDropdown';
import { AppGridCard } from '../components/AppGridCard';
import { AppListCard } from '../components/AppListCard';
import { ViewToggle } from '../components/ViewToggle';
import type { AppData } from '../data';
import { useAppMeta } from '../hooks/useAppMeta';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { FeedbackTrigger } from '../components/FeedbackTrigger';
import { useFeedbackState } from '../hooks/useFeedbackState';
import { AnimatePresence } from 'motion/react';
import { useVoteRegistry } from '../hooks/useVoteRegistry';

interface SoftwarePageProps {
  onNavigate?: (path: string) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'updated-desc' | 'updated-asc' | 'rating' | 'downloads' | 'loved';

export function SoftwarePage({ onNavigate }: SoftwarePageProps) {
  const { apps: unifiedApps } = useAppMeta();
  const location = useLocation();
  const [selectedContentType, setSelectedContentType] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [initialized, setInitialized] = useState(false);
  const { isFeedbackOpen, handleToggle, handleClose } = useFeedbackState();
  const { votes: voteRegistry } = useVoteRegistry();

  // Restore scroll position when coming back from detail page
  useEffect(() => {
    const scrollPos = location.state?.restoreScrollPosition || location.state?.previousScrollPosition;
    const savedScroll = sessionStorage.getItem('software-scroll-position');

    if (scrollPos !== undefined) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollPos, behavior: 'instant' });
        });
      });
      sessionStorage.removeItem('software-scroll-position');
    } else if (savedScroll && location.state?.fromNavigation !== true) {
      const position = parseInt(savedScroll, 10);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: position, behavior: 'instant' });
        });
      });
      sessionStorage.removeItem('software-scroll-position');
    }
  }, [location.state]);

  const contentTypes = ['All', 'Manga', 'Anime', 'Light Novel', 'Multi'];
  const platforms = ['All', 'Android', 'iOS', 'Windows', 'Mac', 'Linux'];
  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'updated-desc', label: 'Recently Updated' },
    { value: 'updated-asc', label: 'Least Recently Updated' },
    { value: 'downloads', label: 'Most Popular' },
    { value: 'loved', label: 'Most Loved' },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') {
      setInitialized(true);
      return;
    }

    const params = new URLSearchParams(window.location.search);

    const platformParam = params.get('platform');
    if (platformParam) {
      const matchedPlatform = platforms.find((option) => option.toLowerCase() === platformParam.toLowerCase());
      if (matchedPlatform) {
        setSelectedPlatform(matchedPlatform);
      }
    }

    const contentParam = params.get('content');
    if (contentParam) {
      const matchedContent = contentTypes.find((option) => option.toLowerCase() === contentParam.toLowerCase());
      if (matchedContent) {
        setSelectedContentType(matchedContent);
      }
    }

    const sortParam = params.get('sort');
    if (sortParam) {
      const matchedSort = sortOptions.find((option) => option.value === sortParam);
      if (matchedSort) {
        setSortBy(matchedSort.value as SortOption);
      }
    }

    const viewParam = params.get('view');
    if (viewParam === 'grid' || viewParam === 'list') {
      setView(viewParam);
    }

    const searchParam = params.get('search');
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (selectedPlatform !== 'All') {
      params.set('platform', selectedPlatform);
    }
    if (selectedContentType !== 'All') {
      params.set('content', selectedContentType);
    }
    if (sortBy !== 'name-asc') {
      params.set('sort', sortBy);
    }
    if (view !== 'grid') {
      params.set('view', view);
    }
    if (searchQuery.trim().length > 0) {
      params.set('search', searchQuery.trim());
    }
    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (newUrl !== currentUrl) {
      window.history.replaceState({}, '', newUrl);
    }
  }, [selectedPlatform, selectedContentType, sortBy, view, searchQuery, initialized]);

  const filteredAndSortedApps = useMemo(() => {
    let filtered = unifiedApps.filter((app: AppData) => {
      // Content type filter
      if (selectedContentType !== 'All') {
        const isMulti = app.contentTypes.length > 1;
        if (selectedContentType === 'Multi') {
          if (!isMulti) return false;
        } else {
          if (!app.contentTypes.includes(selectedContentType as any)) return false;
        }
      }

      // Platform filter
      if (selectedPlatform !== 'All' && !app.platforms.includes(selectedPlatform as any)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          app.name,
          app.description,
          ...(app.keywords || []),
        ].join(' ').toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'updated-desc':
          return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
        case 'updated-asc':
          return (a.lastUpdated || '').localeCompare(b.lastUpdated || '');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'downloads':
          return (b.downloads || 0) - (a.downloads || 0);
        case 'loved':
          return (voteRegistry[b.id]?.count || 0) - (voteRegistry[a.id]?.count || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedContentType, selectedPlatform, searchQuery, sortBy]);

  const handleAppClick = (appId: string) => {
    const currentScrollY = window.scrollY;
    onNavigate?.(`/software/${appId}`);

    sessionStorage.setItem('software-scroll-position', currentScrollY.toString());
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <h1
            className="text-[var(--text-primary)] font-['Poppins',sans-serif]"
            style={{ fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: '1.2', fontWeight: 700 }}
          >
            Software
          </h1>
          <FeedbackTrigger isOpen={isFeedbackOpen} onToggle={handleToggle} title="Software" />
        </div>
        <p className="text-[var(--text-secondary)] font-['Inter',sans-serif]" style={{ fontSize: '16px' }}>
          Apps and software for reading manga, watching anime, and more across all platforms.
        </p>
      </div>

      {/* Inline Feedback Panel */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="mb-8">
            <FeedbackPanel page="software" onClose={handleClose} />
          </div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 mb-6 sm:mb-8 space-y-4">
        <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <FilterDropdown
            label="Platform"
            value={selectedPlatform}
            options={platforms}
            onChange={setSelectedPlatform}
          />

          <FilterDropdown
            label="Content Type"
            value={selectedContentType}
            options={contentTypes}
            onChange={setSelectedContentType}
          />

          <FilterDropdown
            label="Sort By"
            value={sortOptions.find(opt => opt.value === sortBy)?.label || 'Name (A-Z)'}
            options={sortOptions.map(opt => opt.label)}
            onChange={(label) => {
              const option = sortOptions.find(opt => opt.label === label);
              if (option) setSortBy(option.value as SortOption);
            }}
          />
        </div>

        {/* Search Box and View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none flex-shrink-0" />
            <input
              type="text"
              placeholder="Search software by name, description, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 mt-1 bg-[var(--bg-surface)] border border-[var(--divider)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)] transition-colors font-['Inter',sans-serif] text-sm"
            />
          </div>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Apps Display */}
      {
        filteredAndSortedApps.length > 0 ? (
          view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredAndSortedApps.map((app) => (
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
                  voteData={voteRegistry[app.id]}
                  allowFetch={false}
                  forkOf={app.forkOf}
                  upstreamUrl={app.upstreamUrl}
                  onClick={() => handleAppClick(app.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredAndSortedApps.map((app) => (
                <AppListCard
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
                  voteData={voteRegistry[app.id]}
                  allowFetch={false}
                  forkOf={app.forkOf}
                  upstreamUrl={app.upstreamUrl}
                  onClick={() => handleAppClick(app.id)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16 sm:py-24">
            <div className="text-6xl sm:text-8xl mb-6 opacity-50">🔍</div>
            <h3 className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
              No software found
            </h3>
            <p className="text-[var(--text-secondary)] font-['Inter',sans-serif]">
              Try adjusting your filters or search query
            </p>
          </div>
        )
      }

      {/* Results Count */}
      {
        filteredAndSortedApps.length > 0 && (
          <div className="mt-8 text-center text-[var(--text-secondary)] font-['Inter',sans-serif] text-sm">
            Showing {filteredAndSortedApps.length} {filteredAndSortedApps.length === 1 ? 'app' : 'apps'}
          </div>
        )
      }
    </div >
  );
}