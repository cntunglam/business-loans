import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/joy';
import { FC, useEffect, useState } from 'react';
import useMediaQueries from '../../hooks/useMediaQueries';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  keepOpen?: boolean;
}

export const ResponsiveAccordion: FC<AccordionItemProps> = ({ title, children, keepOpen }) => {
  const { sm: isTabletUp } = useMediaQueries(['sm']);
  const [expanded, setExpanded] = useState<boolean>(keepOpen ? true : !!isTabletUp);

  useEffect(() => {
    if (keepOpen) return;
    setExpanded(!!isTabletUp);
  }, [isTabletUp, keepOpen]);

  return (
    <Accordion expanded={expanded} onChange={(_, expanded) => setExpanded(expanded)} sx={{ borderBottom: 'none' }}>
      <AccordionSummary sx={{ p: 1 }}>
        <Typography color="secondary" level="title-lg" fontWeight={'700'}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};
