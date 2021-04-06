/* eslint-disable no-await-in-loop */
import requestify from 'requestify';
import { ProcessNode } from './types';

export const nodeById = (
  properties: ProcessNode[],
  id: number,
): ProcessNode => properties.filter((node) => node.id === id)[0];

export const postNodeIsCoordinator = (node: ProcessNode) => {
  requestify.post(`http://172.13.42.${node.id}:3000/isCoordinator`, node);
};

export const getNode = async (nodeId:number) => requestify
  .get(`http://172.13.42.${nodeId}:3000/`)
  .then(async (response:any) => response.getBody());

export const list = async (allNodeIds:number[]) => {
  for (let i = 0; i < allNodeIds.length; i += 1) {
    const node:ProcessNode = await getNode(allNodeIds[i]);
    console.log(`${node.id}, ${node.name}_${node.electionCount} ${node.isCoordinator ? '(Coordinator)' : ''}`);
  }
};

export const clock = async (allNodeIds:number[]) => {
  for (let i = 0; i < allNodeIds.length; i += 1) {
    const node:ProcessNode = await getNode(allNodeIds[i]);
    console.log(`${node.name}_${node.electionCount}, ${node.time}`);
  }
};
