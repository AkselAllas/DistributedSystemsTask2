/* eslint-disable no-await-in-loop */
import requestify from 'requestify';
import { ProcessNode } from './types';

export const postNodeTime = (nodeId:number, node:ProcessNode) => {
  requestify.post(`http://172.13.42.${nodeId}:3000/time`, node);
};

export const setAllNodesTime = (node:ProcessNode) => {
  node.allNodeIds.forEach((nodeId) => {
    if (nodeId !== node.id) {
      postNodeTime(nodeId, node);
    }
  });
};

export const getNode = async (node:ProcessNode) => requestify
  .get(`http://172.13.42.${node.id}:3000/`)
  .then(async (response:any) => response.getBody());