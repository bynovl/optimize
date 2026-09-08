#!/bin/bash
pnpm changeset 
git add .changeset
git commit -m "chore: prepare packages for release"
git push public HEAD:main