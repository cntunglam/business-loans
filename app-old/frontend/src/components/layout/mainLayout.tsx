import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Flex } from '../shared/flex';
import { Header } from './header';

interface Props {
  noHeader?: boolean;
}

export const MainLayout: FC<Props> = ({ noHeader }) => {
  return (
    <Flex grow y>
      {!noHeader && <Header />}
      <Outlet />
    </Flex>
  );
};
