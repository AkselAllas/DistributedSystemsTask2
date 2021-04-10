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
  .get(`http://172.13.42.${nodeId}:3000/`, { timeout: 500 })
  .then(async (response:any) => response.getBody());

export const list = async (allNodeIds:number[]) => {
  allNodeIds.forEach(async (nodeId) => {
    try {
      const node:ProcessNode = await getNode(nodeId);
      console.log(`${node.id}, ${node.name}_${node.electionCount} ${node.isCoordinator ? '(Coordinator)' : ''}`);
    } catch (e) {
      console.log(`Node ${nodeId} is unresponsive`);
    }
  });
};

export const clock = async (allNodeIds:number[]) => {
  allNodeIds.forEach(async (nodeId) => {
    try {
      const node:ProcessNode = await getNode(nodeId);
      console.log(`${node.name}_${node.electionCount}, ${node.time}`);
    } catch (e) {
      console.log(`Node ${nodeId} is unresponsive`);
    }
  });
};
