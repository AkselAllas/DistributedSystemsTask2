import requestify from 'requestify';
import { ProcessNode } from './types';

export const nodeById = (
  properties: ProcessNode[],
  id: number,
): ProcessNode => properties.filter((node) => node.id === id)[0];

export const postNodeIsCoordinator = (node: ProcessNode) => {
  requestify.post(`http://172.13.42.${node.id}:3000/isCoordinator`, node);
};
