# DistributedHashTableTask

## Setup

1. sudo docker network create --driver bridge --subnet 172.13.42.0/24 --gateway 172.13.42.254 dst2 
2. yarn install
3. yarn build
4. docker build . -t dst2 
5. yarn start
