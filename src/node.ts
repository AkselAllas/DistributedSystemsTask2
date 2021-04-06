#!/usr/bin/env node
import express from 'express';
import bodyParser from 'body-parser';
import {
  format, addMinutes,
} from 'date-fns';
import { ProcessNode } from './types';
import { getIPAddress } from './miscHelpers';
import getDate from './timeHelpers';
import { setAllNodesTime } from './nodeHelpers';

const node:ProcessNode = JSON.parse(process.argv[2]);
const ipAddress:string = getIPAddress();
const frozen:boolean = false;

let d = getDate(node.time);
const makeNodeClockTick = () => {
  if (!frozen && node.isCoordinator) {
    d = addMinutes(d, 1);
    node.time = format(d, 'K:mmaaa');
  }
};

const coordinateNodes = () => {
  if (node.isCoordinator === true) {
    setAllNodesTime(node);
  }
};

// TODO: Set interval from 5000ms to 60000ms after debugging finished
setInterval(makeNodeClockTick, 5000);
setInterval(coordinateNodes, 1000);

console.log(node);
console.log(ipAddress);

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(node);
});

let heartbeatCounter = 0;
const resetHeartbeatCounter = () => {
  if (heartbeatCounter === 0) {
    node.isElecting = true;
  }
  heartbeatCounter = 0;
};

setTimeout(() => {
  setInterval(resetHeartbeatCounter, 5000);
}, 10000);
app.post('/time', (req, res) => {
  heartbeatCounter += 1;
  if (!frozen) {
    const { time } = req.body;
    res.send(`old Time: ${node.time} \n new Time: ${time}`);
    node.time = time;
    d = getDate(time);
  }
});
app.post('/isCoordinator', (req, res) => {
  if (!frozen) {
    const { isCoordinator } = req.body;
    res.send(`old isCoordinator: ${node.isCoordinator} \n new isCoordinator: ${isCoordinator}`);
    node.isCoordinator = isCoordinator;
  }
});
app.post('/electionCount', (req, res) => {
  if (!frozen) {
    const { electionCount } = req.body;
    res.send(`old Time: ${node.electionCount} \n new Time: ${electionCount}`);
    node.electionCount = electionCount;
  }
});
app.post('/allNodeIds', (req, res) => {
  if (!frozen) {
    const { allNodeIds } = req.body;
    res.send(`old Time: ${node.allNodeIds} \n new Time: ${allNodeIds}`);
    node.allNodeIds = allNodeIds;
  }
});

app.listen(port, () => {
  console.log(`App listening at http://${ipAddress}:${port}`);
});
