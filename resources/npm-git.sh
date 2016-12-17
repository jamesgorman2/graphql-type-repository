#!/bin/sh -e

# This script maintains a git branch which mirrors master but in a form that
# what will eventually be deployed to npm, allowing npm dependencies to use:
#
#     "graphql-type-repository": "git://github.com/jamesgorman2/graphql-type-repository#npm"
#

./node_modules/.bin/babel src --ignore __tests__ --out-dir npm
find ./src -name '*.js' -not -path '*/__tests__*' | while read filepath; do cp $filepath `echo $filepath | sed 's/\\/src\\//\\/npm\\//g'`.flow; done

# Ensure a vanilla package.json before deploying so other tools do not interpret
# the built output as requiring any further transformation.
node -e "var package = require('./package.json'); \
  delete package.scripts; \
  delete package.options; \
  delete package.devDependencies; \
  require('fs').writeFileSync('./npm/package.json', JSON.stringify(package, null, 2));"

cp README.md npm/
cp LICENSE npm/

cd npm
git init
git config user.name "James Gorman"
git config user.email "jamesgorman2@gmail.com"
git add .
git commit -m "Deploy master to NPM branch"
git push --force --quiet "https://${GH_TOKEN}@github.com/jamesgorman2/graphql-type-repository.git" master:npm
