#!/usr/bin/env node
import express from 'express';
import bodyParser from 'body-parser';
import { ProcessNode } from './types';
import { getIPAddress } from './helperFunctions';

const node:ProcessNode = JSON.parse(process.argv[2]);
const ipAddress:string = getIPAddress();

console.log(node);
console.log(ipAddress);

const app = express();
const port = 3000;
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', (req, res) => {
  res.send(node);
});

app.post('/time', (req, res) => {
  const { time } = req.body;
  res.send(`old Time: ${node.time} \n new Time: ${time}`);
  node.time = time;
});
app.post('/electionCount', (req, res) => {
  const { electionCount } = req.body;
  res.send(`old Time: ${node.electionCount} \n new Time: ${electionCount}`);
  node.electionCount = electionCount;
});
app.post('/allNodeIds', (req, res) => {
  const { allNodeIds } = req.body;
  res.send(`old Time: ${node.allNodeIds} \n new Time: ${allNodeIds}`);
  node.allNodeIds = allNodeIds;
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
