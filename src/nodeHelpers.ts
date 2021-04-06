/* eslint-disable no-await-in-loop */
import requestify from 'requestify';
import { ProcessNode } from './types';

export const sendNodePostRequest = (node:ProcessNode) => {
  requestify.post(`http://172.13.42.${node.id}:3000/`, node);
};

export const getNode = async (node:ProcessNode) => requestify
  .get(`http://172.13.42.${node.id}:3000/`)
  .then(async (response:any) => response.getBody());
