#!/bin/bash
cd /home/kavia/workspace/code-generation/responsive-computer-show-carousel-441-210242/carousel_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

