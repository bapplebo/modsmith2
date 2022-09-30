import { useEffect, useCallback, useState } from 'react';

const useContextMenu = (outerRef: React.MutableRefObject<HTMLElement | null>) => {
  const [xPos, setXPos] = useState('0px');
  const [yPos, setYPos] = useState('0px');
  const [menu, showMenu] = useState(false);
  const [url, setUrl] = useState<string | undefined>();
  const [modId, setModId] = useState<string | undefined>();

  const handleContextMenu = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      setUrl(undefined);
      if (outerRef && outerRef.current && outerRef.current.contains(event.target as Element)) {
        setXPos(`${event.pageX}px`);
        setYPos(`${event.pageY}px`);
        const target = (event.target as Element).closest('tr');
        if (target) {
          const url = target.getAttribute('data-url');
          const modId = target.getAttribute('data-modid');

          showMenu(true);
          if (url) {
            setUrl(url);
          }

          if (modId) {
            setModId(modId);
          }
        }
      } else {
        setUrl(undefined);
        showMenu(false);
      }
    },
    [showMenu, outerRef, setXPos, setYPos]
  );

  const handleClick = useCallback(() => {
    setUrl(undefined);
    showMenu(false);
  }, [showMenu]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return { xPos, yPos, menu, url, modId };
};

export default useContextMenu;
