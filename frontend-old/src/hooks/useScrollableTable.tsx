import { useEffect, useRef, useState } from 'react';

const SCROLL_VALUE = window.innerWidth * 0.8;

export const useScrollableTable = (isLoading?: boolean) => {
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [showLeftButton, setShowLeftButton] = useState<boolean>(false);
  const [showRightButton, setShowRightButton] = useState<boolean>(true);

  /**
   * Checks the current scroll position of the table and updates the state of
   * the left and right scroll buttons accordingly. If the table is scrolled to
   * the left edge, the left button is hidden. If the table is scrolled past the
   * right edge, the right button is hidden.
   */
  const checkScrollPosition = () => {
    if (tableRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth);
    }
  };

  // scrolls the table to the left by SCROLL_VALUE pixels
  const scrollLeft = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({
        left: -SCROLL_VALUE,
        behavior: 'smooth'
      });
    }
  };

  // scrolls the table to the right by SCROLL_VALUE pixels
  const scrollRight = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({
        left: SCROLL_VALUE,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const tableElement = tableRef.current;

    tableElement && tableElement.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition();

    return () => {
      tableElement && tableElement.removeEventListener('scroll', checkScrollPosition);
    };
  }, [isLoading]);

  return { tableRef, showLeftButton, showRightButton, scrollLeft, scrollRight };
};
