#!/usr/bin/env node
import express from 'express';
import bodyParser from 'body-parser';
import {
  format, addMinutes, differenceInMilliseconds,
} from 'date-fns';
import { ProcessNode } from './types';
import { getIPAddress } from './miscHelpers';
import getDate from './timeHelpers';
import {
  incrementAllNodeElectionCounts, postAllElectionStartedBy,
  postAllIsCoordinator,
  postElectionMessage, postMainProcessInfo, setAllNodesTime,
} from './nodeHelpers';
import { postNodeIsCoordinator, postNodeTime } from './mainHelpers';

const node:ProcessNode = JSON.parse(process.argv[2]);
let latestElectionTime = new Date();
const ipAddress:string = getIPAddress();
let heartbeatCounter = 0;

let d = getDate(node.time);
const makeNodeClockTick = () => {
  if (!node.isFrozen && node.isCoordinator) {
    d = addMinutes(d, 1);
    node.time = format(d, 'K:mmaaa');
  }
};

const coordinateNodes = () => {
  if (node.isCoordinator === true && !node.isFrozen) {
    heartbeatCounter += 1;
    setAllNodesTime(node);
    postAllElectionStartedBy({ ...node, electionStartedBy: -1 });
  }
};

const declareElectionEnded = () => {
  postMainProcessInfo(node.mainProcessIpAddress, `Node ${node.id} is now the coordinator. Election started by ${node.electionStartedBy}`);
  node.isCoordinator = true;
  node.isElecting = false;
  node.electionCount += 1;
  node.electionStartedBy = -1;
  incrementAllNodeElectionCounts(node);
  postAllElectionStartedBy({ ...node, electionStartedBy: -1 });
  postAllIsCoordinator({ ...node, electionStartedBy: -1 });
};

const hasMoreThan5SecPassedFromLastElection = () => differenceInMilliseconds(new Date(), latestElectionTime) > 5000;
const startElection = () => {
  node.electionStartedBy = node.id;
  postAllElectionStartedBy(node);
};
const handleElection = () => {
  if (node.isElecting === true && !node.isFrozen && hasMoreThan5SecPassedFromLastElection()) {
    console.log(`${Date.now()} Starting election: ${JSON.stringify(node)}`);
    latestElectionTime = new Date();
    if (node.electionStartedBy === -1) {
      startElection();
    }
    node.time = format(getDate(node.originalTime), 'K:mmaaa');
    d = getDate(node.originalTime);
    const higherNodeIds = node.allNodeIds.filter((nodeId) => nodeId > node.id);
    let higherNodesCounter = 0;
    higherNodeIds.forEach(async (nodeId) => {
      try {
        const statusCode = await postElectionMessage(nodeId, node);
        if (statusCode === 200) {
          higherNodesCounter += 1;
          node.isElecting = false;
          node.isCoordinator = false;
        }
      } catch (e) {
        console.log(`Node ${nodeId} is unresponsive`);
      }
    });
    // TODO fix hack around awaiting ElectionMessage status codes.Currently 500ms is as timeout.
    setTimeout(() => {
      if (higherNodesCounter === 0 && node.electionStartedBy !== -1) {
        declareElectionEnded();
      }
    }, 500);
  }
};

const checkHeartBeat = () => {
  console.log(`Iam node ${node.id}, heartbeatCounter ${heartbeatCounter}, date: ${Date.now()}`);
  if ((heartbeatCounter === 0 || node.isElecting === true) && hasMoreThan5SecPassedFromLastElection()) {
    node.isElecting = true;
    handleElection();
  }
  heartbeatCounter = 0;
};

const handleMultipleCoordinators = () => {
  if (node.isCoordinator) {
    console.log(`${Date.now()} HANDLING MULTIPLE COORDINATORS ${JSON.stringify(node)}`);

    node.isElecting = true;
  }
};

// TODO: Set interval from 5000ms to 60000ms after debugging finished
setInterval(makeNodeClockTick, 1000);
setInterval(coordinateNodes, 1000);
setTimeout(() => {
  setInterval(checkHeartBeat, 2000);
}, 2000);

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(node);
});

app.post('/time', (req, res) => {
  if (!node.isFrozen) {
    const { isFromNode, time } = req.body;
    if (isFromNode) {
      heartbeatCounter += 1;
      if (hasMoreThan5SecPassedFromLastElection()) handleMultipleCoordinators();
    }
    res.send(`old Time: ${node.time} \n new Time: ${time}`);
    node.time = time;
    d = getDate(time);
  }
});
app.post('/isCoordinator', (req, res) => {
  if (!node.isFrozen) {
    const { isCoordinator } = req.body;
    res.send(`old isCoordinator: ${node.isCoordinator} \n new isCoordinator: ${isCoordinator}`);
    node.isCoordinator = isCoordinator;
  }
});
app.post('/isElecting', (req, res) => {
  if (!node.isFrozen) {
    const { isElecting } = req.body;
    res.send(`old isElecting: ${node.isElecting} \n new isElecting: ${isElecting}`);
    console.log(`${Date.now()} I GOT SET electing from ${JSON.stringify(req.connection.remoteAddress)} and node is: ${JSON.stringify(node)}`);
    if (hasMoreThan5SecPassedFromLastElection()) {
      node.isElecting = isElecting;
    }
  }
});
app.post('/incrementElectionCount', (req, res) => {
  if (!node.isFrozen && node.electionStartedBy !== -1) {
    res.send(`incremented ElectionCount to ${node.electionCount + 1}`);
    node.electionCount += 1;
  }
});
app.post('/electionStartedBy', (req, res) => {
  if (!node.isFrozen && node.electionStartedBy === -1) {
    const { electionStartedBy } = req.body;
    res.send(`old electionStartedBy: ${node.electionStartedBy} \n new electionStartedBy: ${electionStartedBy}`);
    node.electionStartedBy = electionStartedBy;
  }
});
app.post('/freeze', () => {
  console.log(`${Date.now()} freeze`);
  node.isFrozen = true;
});
app.post('/unfreeze', () => {
  console.log(`${Date.now()} unfreeze`);
  node.isFrozen = false;
  postNodeIsCoordinator({ ...node, isCoordinator: true });
  postNodeTime({ ...node, time: node.originalTime });
});
app.post('/allNodeIds', (req, res) => {
  if (!node.isFrozen) {
    const { allNodeIds } = req.body;
    res.send(`old NodeIds: ${node.allNodeIds} \n new NodeIds: ${allNodeIds}`);
    node.allNodeIds = allNodeIds;
  }
});

app.listen(port, () => {
  console.log(`App listening at http://${ipAddress}:${port}`);
});
