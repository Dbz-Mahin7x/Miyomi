import { useState, useEffect } from 'react';
import { Heart, Info } from 'lucide-react';
import { useAnonymousId } from '../hooks/useAnonymousId';
import { voteStorage } from '../utils/voteStorage';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

interface LoveButtonProps {
    itemId: string;
    initialCount?: number;
    className?: string;
    preloadedState?: { count: number; loved: boolean };
    allowFetch?: boolean;
}

export function LoveButton({ itemId, initialCount = 0, className = '', preloadedState, allowFetch = true }: LoveButtonProps) {
    const userId = useAnonymousId();
    const cached = preloadedState ? undefined : voteStorage.getItem(itemId);

    // if (!preloadedState && !cached) console.log('[LoveButton] Cache Miss for', itemId);

    const [count, setCount] = useState(preloadedState?.count ?? cached?.count ?? initialCount);
    const [loved, setLoved] = useState(preloadedState?.loved ?? cached?.loved ?? false);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(!!preloadedState || !!cached);

    useEffect(() => {
        if (preloadedState) {
            setCount(preloadedState.count);
            setLoved(preloadedState.loved);
            setHasFetched(true);
        }
    }, [preloadedState]);

    useEffect(() => {
        if (!userId || preloadedState || !allowFetch) return;

        fetch(`/api/vote?itemId=${itemId}&userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                setCount(data.count);
                setLoved(data.loved);
                setHasFetched(true);
                // Update cache with fresh data
                voteStorage.updateItem(itemId, { count: data.count, loved: data.loved });
            })
            .catch(console.error);
    }, [itemId, userId, preloadedState, allowFetch]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userId || loading) return;

        const newLovedState = !loved;
        setLoved(newLovedState);
        setCount(prev => newLovedState ? prev + 1 : prev - 1);

        voteStorage.updateItem(itemId, { count: count + (newLovedState ? 1 : -1), loved: newLovedState });

        setLoading(true);

        try {
            const res = await fetch(`/api/vote?itemId=${itemId}&userId=${userId}`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to vote');

            const data = await res.json();
            if (data.loved !== newLovedState) {
                setLoved(data.loved);
            }
        } catch (err) {
            setLoved(!newLovedState);
            setCount(prev => !newLovedState ? prev + 1 : prev - 1);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <button
                onClick={handleToggle}
                className={`group flex items-center gap-1.5 rounded-full px-2 py-1 transition-all ${loved
                    ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30'
                    : 'hover:bg-[var(--chip-bg)] text-[var(--text-secondary)] hover:text-rose-500'
                    }`}
                title={loved ? "Unlove this" : "Love this"}
                aria-pressed={loved}
            >
                <Heart
                    className={`w-4 h-4 transition-transform ${loved ? 'fill-current scale-110' : 'group-hover:scale-110'
                        } ${loading ? 'opacity-70' : ''}`}
                />
                <span className={`text-xs font-['Inter',sans-serif] font-medium tabular-nums ${!hasFetched ? 'opacity-50' : ''
                    }`}>
                    {count}
                </span>
            </button>

            {/* <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="cursor-help opacity-40 hover:opacity-100 transition-opacity">
                            <Info className="w-3 h-3 text-[var(--text-secondary)]" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs bg-[var(--popover)] text-[var(--text-primary)] border border-[var(--divider)]">
                        <p>
                            "Love" votes are anonymous. A unique key is stored in your browser to remember your choice.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider> */}
        </div>
    );
}