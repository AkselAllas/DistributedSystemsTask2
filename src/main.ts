import {
  listenForNodeMessages, reload,
} from './mainHelpers';
import { createCLI } from './cliHelpers';

const main = async () => {
  const sortedNodeIds:number[] = await reload();
  createCLI(sortedNodeIds);
  listenForNodeMessages();
};

export default main;
