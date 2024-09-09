#!/bin/bash -l

#
# DORAMETRIX: SCRIPT FOR DEPLOYMENT EVENTS
# https://github.com/mikaelvesavuori/dorametrix
#
# This script makes it easy to run Dorametrix. We need to get the intermediate
# commits between the latest production deployment and the current commit.
# The latest deploy SHA is retrieved from the Dorametrix service.
#
# JSON solution based on comments in: https://gist.github.com/varemenos/e95c2e098e657c7688fd
#

set -o pipefail

echo "✨ Running Dorametrix deployment event script..."

# Set variables
if [ -z "$ENDPOINT" ]; then ENDPOINT="$1"; fi # Input from user when calling the action
echo "ℹ️ ENDPOINT --> $ENDPOINT"
if [ -z "$ENDPOINT" ]; then echo "Dorametrix error: ENDPOINT is not set! Exiting..." && exit 1; fi

if [ -z "$API_KEY" ]; then API_KEY="$2"; fi # Input from user when calling the action
if [ -z "$API_KEY" ]; then echo "Dorametrix error: API_KEY is not set! Exiting..." && exit 1; fi

if [ -z "$REPO" ]; then REPO="$3"; fi # Input from user when calling the action
echo "ℹ️ REPO --> $REPO"
if [ -z "$REPO" ]; then echo "Dorametrix error: REPO is not set! Exiting..." && exit 1; fi

# Get current Git SHA
CURRENT_GIT_SHA=$(git log --pretty=format:'%H' -n 1)
echo "ℹ️ CURRENT_GIT_SHA --> $CURRENT_GIT_SHA"

# Call Dorametrix and create deployment event with Git changes
curl -X POST "$ENDPOINT/event?authorization=$API_KEY" -d '{ "eventType": "deployment", "repo": "'$REPO'", "changeSha": "'$CURRENT_GIT_SHA'" }' -H "Content-Type: application/json"

echo -e "\n✅ Dorametrix deployment script has finished successfully!"
