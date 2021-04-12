/* eslint-disable no-constant-condition */
/* eslint-disable import/prefer-default-export */

import readline from 'readline';
import {
  stopAndRemoveAllDockerContainers, stopAndRemoveDocker,
} from './dockerHelpers';
import {
  clock, list, postFreeze, postUnFreeze, reload,
} from './mainHelpers';
import { postNodeTime } from './nodeHelpers';

export const helpReadme = () => {
  console.log('---- Available Commands -----');
  console.log('help');
  console.log('stopDocker');
  console.log('list');
  console.log('clock');
  console.log('set-time 1 8:00pm');
  console.log('kill 1');
  console.log('freeze 3');
  console.log('unfreeze 5');
  console.log('reload');
  console.log('-----------------------------');
};

const recursiveUserInput = (rl:any, sortedNodeIds:number[]) => {
  rl.question('', async (answer:any) => {
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
    if (args[0] === 'set-time') {
      postNodeTime(parseInt(args[1], 10), {
        id: 1,
        name: '',
        time: args[2],
        electionCount: 0,
        allNodeIds: sortedNodeIds,
        isCoordinator: false,
        isElecting: false,
        originalTime: args[2],
        isFromNode: false,
      });
    }
    if (args[0] === 'kill') {
      stopAndRemoveDocker(args[1]);
    }
    if (args[0] === 'freeze') {
      postFreeze(args[1]);
    }
    if (args[0] === 'unfreeze') {
      postUnFreeze(args[1]);
    }
    if (args[0] === 'reload') {
      const newSortedNodeIds:number[] = await reload();
      recursiveUserInput(rl, newSortedNodeIds);
      return;
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
