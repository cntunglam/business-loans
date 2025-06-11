#!/bin/bash

# Check if application ID is provided
if [ -z "$1" ]; then
  echo "Error: Application ID is required as an argument."
  exit 1
fi

# Check if deployment type is provided
if [ -z "$2" ]; then
  echo "Error: Deployment type is required as an argument."
  exit 1
fi

APP_ID="$1"
DEPLOYMENT_TYPE="$2"

MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  # Get the latest deployment ID
  DEPLOYMENT_ID=$(doctl apps list-deployments "$APP_ID" --format ID --no-header | head -n 1)
  # Check status of the deployment
  STATUS=$(doctl apps get-deployment "$APP_ID" "$DEPLOYMENT_ID" --format Phase --no-header)
  if [ "$STATUS" == "ACTIVE" ]; then
    echo "Deployment successful"
    exit 0
  elif [ "$STATUS" == "ERROR" ]; then
    echo "Deployment failed"
    exit 1
  elif [ "$STATUS" == "CANCELED" ]; then
    echo "Deployment is canceled by user"
    exit 1
  fi
  echo "Waiting for $DEPLOYMENT_TYPE deployment to complete..."
  sleep 20
  ATTEMPT=$((ATTEMPT+1))
done

echo "Deployment verification failed after $MAX_ATTEMPTS attempts."
exit 1
