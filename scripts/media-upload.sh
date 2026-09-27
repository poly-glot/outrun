#!/bin/sh
set -eu

version="${1:?usage: scripts/media-upload.sh <version, e.g. v1>}"
bucket=gs://firebase-cloud-491613-outrun-media

gcloud storage cp --recursive --cache-control='public, max-age=31536000, immutable' public/media/* "$bucket/$version/"
echo "mediaBase: https://storage.googleapis.com/firebase-cloud-491613-outrun-media/$version"
