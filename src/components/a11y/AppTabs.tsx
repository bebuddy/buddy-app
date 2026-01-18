"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type AppTabItem = {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
};

export type AppTabsProps = {
  tabs: AppTabItem[];
  label?: string;
  defaultTabId?: string;
  selectedTabId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  panelClassName?: string;
};

export default function AppTabs({
  tabs,
  label = "탭 목록",
  defaultTabId,
  selectedTabId,
  onChange,
  className,
  tabListClassName,
  tabClassName,
  panelClassName,
}: AppTabsProps) {
  const generatedId = useId();
  const defaultId = defaultTabId ?? tabs.find((tab) => !tab.disabled)?.id ?? tabs[0]?.id;
  const [internalId, setInternalId] = useState(defaultId);
  const currentTabId = selectedTabId ?? internalId;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = useMemo(() => {
    const index = tabs.findIndex((tab) => tab.id === currentTabId);
    return index >= 0 ? index : 0;
  }, [currentTabId, tabs]);

  useEffect(() => {
    if (selectedTabId) {
      return;
    }
    setInternalId(defaultId);
  }, [defaultId, selectedTabId]);

  const setTab = (nextId: string, index: number) => {
    if (tabs[index]?.disabled) {
      return;
    }
    if (!selectedTabId) {
      setInternalId(nextId);
    }
    onChange?.(nextId);
    tabRefs.current[index]?.focus();
  };

  const moveFocus = (direction: "next" | "prev") => {
    if (tabs.length === 0) {
      return;
    }

    let nextIndex = activeIndex;
    for (let i = 0; i < tabs.length; i += 1) {
      nextIndex = direction === "next" ? (nextIndex + 1) % tabs.length : (nextIndex - 1 + tabs.length) % tabs.length;
      if (!tabs[nextIndex]?.disabled) {
        break;
      }
    }

    const nextTab = tabs[nextIndex];
    if (nextTab) {
      setTab(nextTab.id, nextIndex);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        moveFocus("next");
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        moveFocus("prev");
        break;
      case "Home": {
        event.preventDefault();
        const firstEnabledIndex = tabs.findIndex((tab) => !tab.disabled);
        const targetIndex = firstEnabledIndex >= 0 ? firstEnabledIndex : 0;
        const targetTab = tabs[targetIndex];
        if (targetTab) {
          setTab(targetTab.id, targetIndex);
        }
        break;
      }
      case "End": {
        event.preventDefault();
        for (let i = tabs.length - 1; i >= 0; i -= 1) {
          if (!tabs[i]?.disabled) {
            setTab(tabs[i].id, i);
            break;
          }
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className={tabListClassName}>
        {tabs.map((tab, index) => {
          const selected = tab.id === currentTabId;
          const tabId = `tab-${generatedId}-${tab.id}`;
          const panelId = `panel-${generatedId}-${tab.id}`;

          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={tabId}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              disabled={tab.disabled}
              className={tabClassName}
              onClick={() => setTab(tab.id, index)}
              onKeyDown={handleKeyDown}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => {
        const selected = tab.id === currentTabId;
        const tabId = `tab-${generatedId}-${tab.id}`;
        const panelId = `panel-${generatedId}-${tab.id}`;

        return (
          <div
            key={tab.id}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!selected}
            tabIndex={0}
            className={panelClassName}
          >
            {tab.content}
          </div>
        );
      })}
    </div>
  );
}
