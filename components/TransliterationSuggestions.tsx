interface TransliterationSuggestionsProps {
  suggestions: string[];
  selectedIndex: number;
  onSelect: (suggestion: string) => void;
  show: boolean;
}

export default function TransliterationSuggestions({
  suggestions,
  selectedIndex,
  onSelect,
  show,
}: TransliterationSuggestionsProps) {
  if (!show || suggestions.length === 0) return null;

  return (
    <div className="suggestions-dropdown">
      {suggestions.slice(0, 5).map((suggestion, index) => (
        <div
          key={index}
          className={`suggestion-item${index === selectedIndex ? ' selected' : ''}`}
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </div>
      ))}
    </div>
  );
}
