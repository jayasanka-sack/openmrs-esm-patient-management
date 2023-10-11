#!/bin/bash

export E2E_BASE_URL=https://dev3.openmrs.org/openmrs
export CI=true

while [ "$(curl -s -o /dev/null -w ''%{http_code}'' $E2E_BASE_URL/login.htm)" != "200" ]; do
  echo "Waiting for the backend to be up..."
  sleep 10

done


npx playwright test -g "View active visits"
