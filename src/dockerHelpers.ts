/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
import { exec } from 'child_process';
import { Promise as BluebirdPromise, resolve } from 'bluebird';
import { ProcessNode } from './types';

const asyncExec:Function = BluebirdPromise.promisify(exec);

export const createDockerContainer = async (node: ProcessNode) => {
  try {
    await asyncExec(
      `export JSON={\\"id\\":${node.id},\\"name\\":\\"${node.name}\\",\\"electionCount\\":${node.electionCount},\\"time\\":\\"${node.time}\\",\\"allNodeIds\\":[${node.allNodeIds}],\\"isCoordinator\\":${node.isCoordinator},\\"isElecting\\":${node.isElecting}} ; docker run --network dst2 --ip 172.13.42.${node.id} --name dst2-${node.id} -dit dst2 /usr/local/bin/node /app/src/node.js $JSON`,
    );
    console.log('Started node with id: ', node.id);
  } catch (e) {
    console.log(`${node.id} is already running`);
  }
};
export const stopAndRemoveAllDockerContainers = () => {
  console.log('Stopping and removing all dst2 docker containers');
  exec(
    'docker container stop $(docker container ls -a --filter name=dst2-) ; docker container rm $(docker container ls -a --filter name=dst2-)',
    () => {
      setTimeout(() => {
        console.log('Docker containers removed');
      }, 2000);
    },
  );
};
