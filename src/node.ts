#!/usr/bin/env node
import express from 'express';
import bodyParser from 'body-parser';
import {
  format, addMinutes,
} from 'date-fns';
import { ProcessNode } from './types';
import { getIPAddress } from './miscHelpers';
import getDate from './timeHelpers';
import {
  incrementAllNodeElectionCounts, postAllElectionStartedBy,
  postElectionMessage, postMainProcessInfo, setAllNodesTime,
} from './nodeHelpers';

const node:ProcessNode = JSON.parse(process.argv[2]);
const ipAddress:string = getIPAddress();
const isfrozen:boolean = false;
let heartbeatCounter = 0;

let d = getDate(node.time);
const makeNodeClockTick = () => {
  if (!isfrozen && node.isCoordinator) {
    d = addMinutes(d, 1);
    node.time = format(d, 'K:mmaaa');
  }
};

const coordinateNodes = () => {
  if (node.isCoordinator === true && !isfrozen) {
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
};

const startElection = () => {
  node.electionStartedBy = node.id;
  postAllElectionStartedBy(node);
};
const handleElection = () => {
  if (node.isElecting === true && !isfrozen) {
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

// TODO: Set interval from 5000ms to 60000ms after debugging finished
setInterval(makeNodeClockTick, 5000);
setInterval(coordinateNodes, 1000);
setInterval(handleElection, 1000);

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(node);
});

const checkHeartBeat = () => {
  if (heartbeatCounter === 0) {
    node.isElecting = true;
  }
  heartbeatCounter = 0;
};

const handleMultipleCoordinators = () => {
  if (node.isCoordinator) {
    node.isElecting = true;
  }
};

setTimeout(() => {
  setInterval(checkHeartBeat, 10000);
}, 5000 + node.id * 2000);
app.post('/time', (req, res) => {
  if (!isfrozen) {
    const { isFromNode, time } = req.body;
    if (isFromNode) {
      heartbeatCounter += 1;
      handleMultipleCoordinators();
    }
    res.send(`old Time: ${node.time} \n new Time: ${time}`);
    node.time = time;
    d = getDate(time);
  }
});
app.post('/isCoordinator', (req, res) => {
  if (!isfrozen) {
    const { isCoordinator } = req.body;
    res.send(`old isCoordinator: ${node.isCoordinator} \n new isCoordinator: ${isCoordinator}`);
    node.isCoordinator = isCoordinator;
  }
});
app.post('/isElecting', (req, res) => {
  if (!isfrozen) {
    const { isElecting } = req.body;
    res.send(`old isElecting: ${node.isElecting} \n new isElecting: ${isElecting}`);
    node.isElecting = isElecting;
  }
});
app.post('/incrementElectionCount', (req, res) => {
  if (!isfrozen && node.electionStartedBy !== -1) {
    res.send(`incremented ElectionCount to ${node.electionCount + 1}`);
    node.electionCount += 1;
  }
});
app.post('/electionStartedBy', (req, res) => {
  if (!isfrozen && node.electionStartedBy === -1) {
    const { electionStartedBy } = req.body;
    res.send(`old electionStartedBy: ${node.electionStartedBy} \n new electionStartedBy: ${electionStartedBy}`);
    node.electionStartedBy = electionStartedBy;
  }
});
app.post('/allNodeIds', (req, res) => {
  if (!isfrozen) {
    const { allNodeIds } = req.body;
    res.send(`old NodeIds: ${node.allNodeIds} \n new NodeIds: ${allNodeIds}`);
    node.allNodeIds = allNodeIds;
  }
});

app.listen(port, () => {
  console.log(`App listening at http://${ipAddress}:${port}`);
});
