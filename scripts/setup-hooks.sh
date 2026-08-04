#!/bin/sh

set -e

repository_root=$(git rev-parse --show-toplevel)
git -C "$repository_root" config core.hooksPath .githooks
echo "Git hooks enabled: $repository_root/.githooks"
