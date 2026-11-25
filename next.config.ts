import type { NextConfig } from 'next';

const config: NextConfig = {
  // "/" opens the Bangla fare finder; old links with ?from=&to= keep working
  async redirects() {
    return [{ source: '/', destination: '/bn', permanent: false }];
  },
};

export default config;
