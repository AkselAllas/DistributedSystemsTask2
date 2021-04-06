import { createDockerContainer } from './dockerHelpers';
import readPropertiesFromFile from './readPropertiesFromFile';
import { ProcessNode } from './types';
import { nodeById, postNodeIsCoordinator } from './mainHelpers';

const main = async () => {
  const properties:ProcessNode[] = await readPropertiesFromFile(process.argv[2]);
  const biggestProcessId = properties[0].allNodeIds.sort((a, b) => b - a)[0];
  await Promise.all(properties.map((node) => createDockerContainer(node)));

  postNodeIsCoordinator({ ...nodeById(properties, biggestProcessId), isCoordinator: true });
  console.log('Coordinator is node with processId: ', biggestProcessId);
};

export default main;
