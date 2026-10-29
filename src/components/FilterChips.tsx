import React from 'react';
import { FilterState } from '../types';
import { X, Calendar, GraduationCap } from 'lucide-react';

interface FilterChipsProps {
  years: string[];
  semesters: string[];
  filterState: FilterState;
  onFilterChange: (next: FilterState) => void;
  onClearFilter: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  years,
  semesters,
  filterState,
  onFilterChange,
  onClearFilter,
}) => {
  const hasActiveFilter = filterState.year !== 'all' || filterState.semester !== 'all';

  return (
    <div className="space-y-2 mb-4">
      {/* Year Filter Segment */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
        <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-400 dark:text-neutral-500 shrink-0">
          <Calendar className="h-3 w-3" />
          <span>Year:</span>
        </span>

        <button
          onClick={() => onFilterChange({ ...filterState, year: 'all' })}
          className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            filterState.year === 'all'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
              : 'text-neutral-600 hover:bg-neutral-200/70 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          All Years
        </button>

        {years.map((year) => {
          const isSelected = filterState.year === year;
          return (
            <button
              key={year}
              onClick={() => onFilterChange({ ...filterState, year: isSelected ? 'all' : year })}
              className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-mono transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              {year}
            </button>
          );
        })}
      </div>

      {/* Semester Filter Segment */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
        <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-400 dark:text-neutral-500 shrink-0">
          <GraduationCap className="h-3 w-3" />
          <span>Semester:</span>
        </span>

        <button
          onClick={() => onFilterChange({ ...filterState, semester: 'all' })}
          className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            filterState.semester === 'all'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
              : 'text-neutral-600 hover:bg-neutral-200/70 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          All Semesters
        </button>

        {semesters.map((sem) => {
          const isSelected = filterState.semester === sem;
          return (
            <button
              key={sem}
              onClick={() => onFilterChange({ ...filterState, semester: isSelected ? 'all' : sem })}
              className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              {sem}
            </button>
          );
        })}

        {hasActiveFilter && (
          <button
            onClick={onClearFilter}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0 ml-2 transition-colors"
            title="Reset active filters"
          >
            <X className="h-3 w-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
