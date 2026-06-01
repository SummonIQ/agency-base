import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { Style } from '@/constants/styles';
import { Theme } from '@/constants/themes';

type Config = {
  radius: number;
  style: Style['name'];
  theme: Theme['name'];
};

const configAtom = atomWithStorage<Config>('config', {
  radius: 0.5,
  style: 'default',
  theme: 'green',
});

export function useConfig() {
  return useAtom(configAtom);
}
