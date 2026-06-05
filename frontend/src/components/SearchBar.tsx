import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface Props {
  onSearch: (q: string) => void;
}

export function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, 300);

  useEffect(() => {
    onSearch(debounced);
  }, [debounced, onSearch]);

  return (
    <div className="search-bar">
      <span className="search-icon" aria-hidden>⌕</span>
      <input
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Search tasks by title…"
        aria-label="Search tasks"
        data-testid="search-input"
      />
      {value && (
        <button className="search-clear" onClick={() => setValue('')} aria-label="Clear search">✕</button>
      )}
    </div>
  );
}
