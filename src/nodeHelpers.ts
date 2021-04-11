/* eslint-disable no-await-in-loop */
import requestify from 'requestify';
import { ProcessNode } from './types';

export const postNodeTime = (nodeId:number, node:any) => {
  requestify.post(`http://172.13.42.${nodeId}:3000/time`, node);
};

export const setAllNodesTime = (node:ProcessNode) => {
  node.allNodeIds.forEach((nodeId) => {
    if (nodeId !== node.id) {
      postNodeTime(nodeId, { ...node, isFromNode: true });
    }
  });
};

export const postNodeIncrementElectionCount = (nodeId:number, node:any) => {
  requestify.post(`http://172.13.42.${nodeId}:3000/incrementElectionCount`, node);
};
export const postNodeElectionStartedBy = (nodeId:number, node:any) => {
  requestify.post(`http://172.13.42.${nodeId}:3000/electionStartedBy`, node);
};

export const incrementAllNodeElectionCounts = (node:ProcessNode) => {
  node.allNodeIds.forEach((nodeId) => {
    if (nodeId !== node.id) {
      postNodeIncrementElectionCount(nodeId, { ...node, isFromNode: true });
    }
  });
};
export const postAllElectionStartedBy = (node:ProcessNode) => {
  node.allNodeIds.forEach((nodeId) => {
    if (nodeId !== node.id) {
      postNodeElectionStartedBy(nodeId, { ...node, isFromNode: true });
    }
  });
};

export const getNode = async (node:ProcessNode) => requestify
  .get(`http://172.13.42.${node.id}:3000/`)
  .then(async (response:any) => response.getBody());

export const postElectionMessage = async (nodeId:number, node:ProcessNode) => requestify
  .post(`http://172.13.42.${nodeId}:3000/isElecting`, node)
  .then(async (response:any) => response.getCode());

export const postMainProcessInfo = (ipAddress:string, info:string) => {
  requestify.post(`http://${ipAddress}:3000/`, { stringMessage: info });
};
