import readPropertiesFromFile from './readPropertiesFromFile';
import { ProcessNode } from './types';

const main = async () => {
  const properties:ProcessNode[] = await readPropertiesFromFile(process.argv[2]);
  console.log(properties);
};

export default main;
