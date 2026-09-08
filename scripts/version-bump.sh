#!/bin/bash
pnpm changeset version
git add .
git commit -m "chore: prepare packages for release"
git push public HEAD:main