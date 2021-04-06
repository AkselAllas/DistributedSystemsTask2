/* eslint-disable no-constant-condition */
/* eslint-disable import/prefer-default-export */

import readline from 'readline';
import {
  stopAndRemoveAllDockerContainers,
} from './dockerHelpers';
import { clock, list } from './mainHelpers';

export const helpReadme = () => {
  console.log('---- Available Commands -----');
  console.log('help');
  console.log('stopDocker');
  console.log('list');
  console.log('clock');
  console.log('-----------------------------');
};

const recursiveUserInput = (rl:any, sortedNodeIds:number[]) => {
  rl.question('', (answer:any) => {
    const args = answer.split(' ');
    if (args[0] === 'help') {
      helpReadme();
    }
    if (args[0] === 'stopDocker') {
      stopAndRemoveAllDockerContainers();
    }
    if (args[0] === 'list') {
      list(sortedNodeIds);
    }
    if (args[0] === 'clock') {
      clock(sortedNodeIds);
    }
    recursiveUserInput(rl, sortedNodeIds);
  });
};

export const createCLI = (sortedNodeIds:number[]) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  setTimeout(() => {
    console.log("Type 'help' for list of available commands");
  }, 1500);
  recursiveUserInput(rl, sortedNodeIds);
};
