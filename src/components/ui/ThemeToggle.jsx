import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';
import Select from './Select';
import Icon from '../AppIcon';

const ThemeToggle = ({ variant = 'button', onToggle }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Enhanced toggle handler with dropdown closure (Fix for bug #6)
  const handleToggle = () => {
    toggleTheme();
    if (onToggle) {
      onToggle();
    }
  };

  const handleThemeSelect = (themeValue) => {
    setTheme(themeValue);
    setIsOpen(false);
    if (onToggle) {
      onToggle();
    }
  };

  if (variant === 'select') {
    return (
      <div className="flex items-center space-x-2">
        <Icon 
          name={resolvedTheme === 'dark' ? 'Moon' : 'Sun'} 
          size={16} 
          className="text-muted-foreground" 
        />
        <Select
          options={themes?.map(t => ({ value: t?.value, label: t?.label }))}
          value={theme}
          onChange={(value) => {
            setTheme(value);
            if (onToggle) onToggle();
          }}
          className="w-28"
        />
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative" data-dropdown="theme">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Icon 
            name={resolvedTheme === 'dark' ? 'Moon' : 'Sun'} 
            size={18}
            className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Icon 
            name="Sun" 
            size={18}
            className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
        </Button>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-20">
              {themes?.map((themeOption) => (
                <button
                  key={themeOption?.value}
                  onClick={() => handleThemeSelect(themeOption?.value)}
                  className={`
                    flex items-center space-x-3 w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors
                    ${theme === themeOption?.value ? 'bg-muted font-medium' : ''}
                  `}
                >
                  <Icon name={themeOption?.icon} size={16} />
                  <span>{themeOption?.label}</span>
                  {theme === themeOption?.value && (
                    <Icon name="Check" size={14} className="ml-auto text-primary" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Enhanced default button variant with callback
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      className="transition-all duration-200"
    >
      <Icon 
        name={resolvedTheme === 'dark' ? 'Sun' : 'Moon'} 
        size={18}
        className="transition-transform duration-300"
      />
    </Button>
  );
};

export default ThemeToggle;