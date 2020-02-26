#!/bin/bash

set -x

cd "$(dirname "$0")"

zip -r zikiosk.zip * -x build.sh,*.zip
