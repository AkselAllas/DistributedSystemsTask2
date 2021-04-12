/* eslint-disable no-await-in-loop */
import requestify from 'requestify';
import express from 'express';
import bodyParser from 'body-parser';
import { ProcessNode } from './types';

import readPropertiesFromFile from './readPropertiesFromFile';

import { getIPAddress } from './miscHelpers';
import { createDockerContainer, stopAndRemoveDocker } from './dockerHelpers';

export const nodeById = (
  properties: ProcessNode[],
  id: number,
): ProcessNode => properties.filter((node) => node.id === id)[0];

export const postNodeIsCoordinator = (node: ProcessNode) => {
  requestify.post(`http://172.13.42.${node.id}:3000/isCoordinator`, node);
};
export const postNodeTime = (node: ProcessNode) => {
  requestify.post(`http://172.13.42.${node.id}:3000/Time`, node);
};

export const getNode = async (nodeId:number) => requestify
  .get(`http://172.13.42.${nodeId}:3000/`, { timeout: 500 })
  .then(async (response:any) => response.getBody());

export const list = async (allNodeIds:number[]) => {
  allNodeIds.forEach(async (nodeId) => {
    try {
      const node:ProcessNode = await getNode(nodeId);
      console.log(`${node.id}, ${node.name}_${node.electionCount} ${node.isCoordinator ? '(Coordinator)' : ''} ${node.isFrozen ? '(Frozen)' : ''}`);
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

export const listenForNodeMessages = () => {
  const app = express();
  const port = 3000;
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.post('/', (req:any) => {
    const { stringMessage } = req.body;
    console.log(stringMessage);
  });
  app.listen(port, () => {
  });
};

export const postFreeze = (nodeId: string) => {
  requestify.post(`http://172.13.42.${nodeId}:3000/freeze`);
};

export const postUnFreeze = (nodeId: string) => {
  requestify.post(`http://172.13.42.${nodeId}:3000/unfreeze`);
};

export const postNodeAllNodeIds = (nodeId: number, node: ProcessNode) => {
  requestify.post(`http://172.13.42.${nodeId}:3000/allNodeIds`, node);
};

export const postAllAllNodeIds = async (node:ProcessNode) => {
  const oldNode:ProcessNode = await getNode(node.id);
  const difference = oldNode.allNodeIds.filter((x) => !node.allNodeIds.includes(x));
  node.allNodeIds.forEach((nodeId) => {
    if (nodeId !== node.id) {
      postNodeAllNodeIds(nodeId, node);
    }
  });
  difference.forEach((nodeId) => {
    stopAndRemoveDocker(nodeId);
  });
};

export const reload = async () => {
  const ipAddress:string = getIPAddress();
  const properties:ProcessNode[] = await readPropertiesFromFile(process.argv[2], ipAddress);
  const sortedNodeIds = properties[0].allNodeIds.sort((a, b) => b - a);
  const biggestProcessId = sortedNodeIds[0];
  await Promise.all(properties.map((node) => createDockerContainer(node)));

  setTimeout(() => {
    postNodeIsCoordinator({ ...nodeById(properties, biggestProcessId), isCoordinator: true });
    postAllAllNodeIds(nodeById(properties, biggestProcessId));
    setTimeout(() => {
      postNodeTime({ ...nodeById(properties, biggestProcessId), time: nodeById(properties, biggestProcessId).originalTime });
    }, 2000);
  }, 1500);
  console.log('Coordinator is node with processId: ', biggestProcessId);

  return sortedNodeIds;
};
