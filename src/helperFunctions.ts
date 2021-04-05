/* eslint-disable nonblock-statement-body-position */
/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import os from 'os';

export const getIPAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface: any = interfaces[devName];

    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === 'IPv4'
        && alias.address !== '127.0.0.1'
        && !alias.internal
      ) {
        return alias.address;
      }
    }
  }
  return '0.0.0.0';
};

export const generateRange = (start:any, end:any) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};
