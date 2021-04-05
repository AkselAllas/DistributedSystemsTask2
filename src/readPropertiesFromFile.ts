import * as fs from 'fs';
import { Promise as BluebirdPromise } from 'bluebird';
import lineReader from 'line-reader';
import { ProcessNode } from './types';

const parseAndConstructNode = (line:string) => {
  const split = line.replace(/\s/g, '').split(',');
  const processIdentifiers = split[1].split('_');
  console.log(processIdentifiers);
  const electionNumberParse = parseInt(processIdentifiers[1], 10);
  const electionCount = Number.isNaN(electionNumberParse) ? 0 : electionNumberParse;
  const node:ProcessNode = {
    id: parseInt(split[0], 10),
    name: processIdentifiers[0],
    electionCount,
    time: split[2],
    allNodeIds: [0],
  };
  return node;
};

const getAllNodeIds = (properties: ProcessNode[]) => {
  const allNodeIds:number[] = [];
  properties.forEach((node) => {
    allNodeIds.push(node.id);
  });
  return allNodeIds;
};

const addCorrectAllNodeIdsToProperties = (properties: ProcessNode[], allNodeIds: number[]) => {
  const correctProperties: ProcessNode[] = [];
  properties.forEach((node) => {
    correctProperties.push({ ...node, allNodeIds });
  });
  return correctProperties;
};

const readPropertiesFromFile = async (path: fs.PathLike) => {
  if (!fs.existsSync(path)) {
    throw new Error(`Failed to read file: ${path}`);
  }
  const initialProperties:ProcessNode[] = [];
  const promisedEachLine: any = BluebirdPromise.promisify(lineReader.eachLine);
  await promisedEachLine(path, (line: any) => {
    const nodeInfo:ProcessNode = parseAndConstructNode(line);
    initialProperties.push(nodeInfo);
  });

  const allNodeIds = getAllNodeIds(initialProperties);
  const correctProperties = addCorrectAllNodeIdsToProperties(initialProperties, allNodeIds);

  return correctProperties;
};

export default readPropertiesFromFile;
