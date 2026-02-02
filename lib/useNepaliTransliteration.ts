import { useState, useEffect } from 'react';

interface UseNepaliTransliterationOptions {
  enabled: boolean;
  fieldName: string;
}

interface TransliterationResult {
  suggestions: string[];
  showSuggestions: boolean;
  selectedIndex: number;
  handleChange: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  applySuggestion: (suggestion: string) => void;
  setSelectedIndex: (index: number) => void;
  clearSuggestions: () => void;
}

export function useNepaliTransliteration(
  value: string,
  setValue: (value: string) => void,
  options: UseNepaliTransliterationOptions
): TransliterationResult {
  const [googleTransliterate, setGoogleTransliterate] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Load google-input-tool dynamically when enabled
  useEffect(() => {
    let isMounted = true;
    if (options.enabled && !googleTransliterate) {
      import('google-input-tool').then((mod) => {
        if (isMounted) setGoogleTransliterate(() => mod.default || mod);
      });
    }
    if (!options.enabled) {
      setGoogleTransliterate(null);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    return () => {
      isMounted = false;
    };
  }, [options.enabled, googleTransliterate]);

  const handleTransliteration = async (text: string) => {
    if (!options.enabled || !googleTransliterate || !text) {
      setSuggestions([]);
      return;
    }

    try {
      // Get the last word being typed - split by spaces and newlines
      const words = text.split(/[\s\n]+/);
      const lastWord = words[words.length - 1];
      if (lastWord.length === 0 || !lastWord.trim()) {
        setSuggestions([]);
        return;
      }

      // google-input-tool expects: (request, sourceText, inputLanguageCode, maxResult)
      const req = new XMLHttpRequest();
      const inputLanguage = 'ne-t-i0-und';
      const maxResult = 5;
      const result = await googleTransliterate(req, lastWord, inputLanguage, maxResult);
      
      // result is an array of [full, suggestion] pairs, we want just the suggestion part
      if (Array.isArray(result) && result.length > 0) {
        setSuggestions(result.map((r: any) => (Array.isArray(r) ? r[1] : r)));
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Transliteration error:', error);
      setSuggestions([]);
    }
  };

  const applySuggestion = (suggestion: string) => {
    // Find the last word boundary (space or newline)
    const match = value.match(/^([\s\S]*[\s\n])([^\s\n]*)$/);
    if (match) {
      setValue(match[1] + suggestion);
    } else {
      setValue(suggestion);
    }
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (options.enabled) {
      handleTransliteration(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === ' ') {
        e.preventDefault();
        // Find the last word boundary (space or newline)
        const match = value.match(/^([\s\S]*[\s\n])([^\s\n]*)$/);
        if (match) {
          setValue(match[1] + suggestions[selectedIndex] + ' ');
        } else {
          setValue(suggestions[selectedIndex] + ' ');
        }
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return {
    suggestions,
    showSuggestions,
    selectedIndex,
    handleChange,
    handleKeyDown,
    applySuggestion,
    setSelectedIndex,
    clearSuggestions,
  };
}
