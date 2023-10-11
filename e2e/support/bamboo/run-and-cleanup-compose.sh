#!/bin/bash

export USER_ID=$(id -u)
export GROUP_ID=$(id -g)
# Run Docker Compose up in detached mode
docker compose up --build


