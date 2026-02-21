import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { FilterDropdown } from '../components/FilterDropdown';
import { ViewToggle } from '../components/ViewToggle';
import { unifiedExtensions, ExtensionData } from '../data';
import { ExtensionGridCard } from '../components/ExtensionGridCard';
import { ExtensionListCard } from '../components/ExtensionListCard';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { FeedbackTrigger } from '../components/FeedbackTrigger';
import { useFeedbackState } from '../hooks/useFeedbackState';
import { AnimatePresence } from 'motion/react';
import { useVoteRegistry } from '../hooks/useVoteRegistry';

interface ExtensionsPageProps {
  onNavigate?: (path: string) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'updated-desc' | 'updated-asc' | 'rating' | 'loved';

export function ExtensionsPage({ onNavigate }: ExtensionsPageProps) {
  const location = useLocation();
  const [selectedApp, setSelectedApp] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [initialized, setInitialized] = useState(false);
  const { isFeedbackOpen, handleToggle, handleClose } = useFeedbackState();
  const { votes: voteRegistry } = useVoteRegistry();

  // Restore scroll position when coming back from detail page
  useEffect(() => {
    const scrollPos = location.state?.restoreScrollPosition || location.state?.previousScrollPosition;
    const savedScroll = sessionStorage.getItem('extensions-scroll-position');

    if (scrollPos !== undefined) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollPos, behavior: 'instant' });
        });
      });
      sessionStorage.removeItem('extensions-scroll-position');
    } else if (savedScroll && location.state?.fromNavigation !== true) {
      const position = parseInt(savedScroll, 10);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: position, behavior: 'instant' });
        });
      });
      sessionStorage.removeItem('extensions-scroll-position');
    }
  }, [location.state]);

  const apps = ['All', 'Aniyomi', 'Mihon', 'Dantotsu', 'Mangayomi'];
  const types = ['All', 'Anime', 'Manga', 'Light Novel'];
  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'updated-desc', label: 'Recently Updated' },
    { value: 'updated-asc', label: 'Least Recently Updated' },
    { value: 'loved', label: 'Most Loved' },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') {
      setInitialized(true);
      return;
    }

    const params = new URLSearchParams(window.location.search);

    const appParam = params.get('app');
    if (appParam) {
      const matchedApp = apps.find((option) => option.toLowerCase() === appParam.toLowerCase());
      if (matchedApp) {
        setSelectedApp(matchedApp);
      }
    }

    const typeParam = params.get('type');
    if (typeParam) {
      const matchedType = types.find((option) => option.toLowerCase() === typeParam.toLowerCase());
      if (matchedType) {
        setSelectedType(matchedType);
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
    if (selectedApp !== 'All') {
      params.set('app', selectedApp);
    }
    if (selectedType !== 'All') {
      params.set('type', selectedType);
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
  }, [selectedApp, selectedType, sortBy, view, searchQuery, initialized]);

  const filteredAndSortedExtensions = useMemo(() => {
    let filtered = unifiedExtensions.filter((ext: ExtensionData) => {
      // App compatibility filter
      if (selectedApp !== 'All' && !ext.supportedApps.includes(selectedApp.toLowerCase())) {
        return false;
      }

      // Type filter
      if (selectedType !== 'All' && !ext.types.includes(selectedType as any)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          ext.name,
          ...ext.types,
          ext.region,
          ext.info,
          ...(ext.supportedApps || []),
          ...(ext.keywords || []),
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
        case 'loved':
          return (voteRegistry[b.id]?.count || 0) - (voteRegistry[a.id]?.count || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedApp, selectedType, searchQuery, sortBy]);

  const handleExtensionClick = (extensionId: string) => {
    const currentScrollY = window.scrollY;
    onNavigate?.(`/extensions/${extensionId}`);

    sessionStorage.setItem('extensions-scroll-position', currentScrollY.toString());
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
            Extension Sources
          </h1>
          <FeedbackTrigger isOpen={isFeedbackOpen} onToggle={handleToggle} title="Extensions" />
        </div>
        <p className="text-[var(--text-secondary)] font-['Inter',sans-serif]" style={{ fontSize: '16px' }}>
          Extension repositories and sources for Mihon, Aniyomi, Dantotsu, and compatible apps.
        </p>
      </div>

      {/* Inline Feedback Panel */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="mb-8">
            <FeedbackPanel page="extensions" onClose={handleClose} />
          </div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 mb-6 sm:mb-8 space-y-4">
        {/* Dropdowns */}
        <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <FilterDropdown
            label="App Compatibility"
            value={selectedApp}
            options={apps}
            onChange={setSelectedApp}
          />
          <FilterDropdown
            label="Content Type"
            value={selectedType}
            options={types}
            onChange={setSelectedType}
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
              placeholder="Search extensions by name, description, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 mt-1 bg-[var(--bg-surface)] border border-[var(--divider)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)] transition-colors font-['Inter',sans-serif] text-sm"
            />
          </div>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Extensions Display */}
      {filteredAndSortedExtensions.length > 0 ? (
        view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-8">
            {filteredAndSortedExtensions.map((ext) => (
              <ExtensionGridCard
                key={ext.id}
                extension={ext}
                voteData={voteRegistry[ext.id]}
                allowFetch={false}
                onSelect={handleExtensionClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {filteredAndSortedExtensions.map((ext) => (
              <ExtensionListCard
                key={ext.id}
                extension={ext}
                voteData={voteRegistry[ext.id]}
                allowFetch={false}
                onSelect={handleExtensionClick}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-16 sm:py-24 mb-8">
          <div className="text-6xl sm:text-8xl mb-6 opacity-50">🔌</div>
          <h3
            className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-2"
            style={{ fontSize: '20px', fontWeight: 600 }}
          >
            No extension sources found
          </h3>
          <p className="text-[var(--text-secondary)] font-['Inter',sans-serif]">
            Try adjusting your filters or search query
          </p>
        </div>
      )}

      {/* Results Count */}
      {filteredAndSortedExtensions.length > 0 && (
        <div className="text-center text-[var(--text-secondary)] font-['Inter',sans-serif] text-sm mb-8">
          Showing {filteredAndSortedExtensions.length} extension {filteredAndSortedExtensions.length === 1 ? 'source' : 'sources'}
        </div>
      )}
    </div>
  );
}