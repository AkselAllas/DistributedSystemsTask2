import { createDockerContainer } from './dockerHelpers';
import readPropertiesFromFile from './readPropertiesFromFile';
import { ProcessNode } from './types';
import { nodeById, postNodeIsCoordinator, postNodeTime } from './mainHelpers';
import { createCLI } from './cliHelpers';

const main = async () => {
  const properties:ProcessNode[] = await readPropertiesFromFile(process.argv[2]);
  const sortedNodeIds = properties[0].allNodeIds.sort((a, b) => b - a);
  const biggestProcessId = sortedNodeIds[0];
  await Promise.all(properties.map((node) => createDockerContainer(node)));

  setTimeout(() => {
    postNodeIsCoordinator({ ...nodeById(properties, biggestProcessId), isCoordinator: true });
    postNodeTime(nodeById(properties, biggestProcessId));
  }, 1000);
  console.log('Coordinator is node with processId: ', biggestProcessId);
  createCLI(sortedNodeIds);
};

export default main;
