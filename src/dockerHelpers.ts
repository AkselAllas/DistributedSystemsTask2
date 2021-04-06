import { exec } from 'child_process';
import { ProcessNode } from './types';

export const createDockerContainer = (node: ProcessNode) => exec(
  `docker run --network dht --ip 172.13.42.${node.id} --name dst2-${node.id} -dit dst2 /usr/local/bin/node /app/src/node.js ${JSON.stringify(
    node,
  )}`,
  (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`created node: ${node}`);
  },
);
export const stopAndRemoveAllDHTDockerContainers = () => {
  exec(
    'docker container stop $(docker container ls -a --filter name=dst2-) ; docker container rm $(docker container ls -a --filter name=dst2-)',
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`output: ${stdout}`);
    },
  );
};
