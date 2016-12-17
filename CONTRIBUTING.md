# Contributing to graphql-type-repository

We want to make contributing to this project as easy and transparent as
possible. Hopefully this document makes the process for contributing clear and
answers any questions you may have. If not, feel free to open an
[Issue](https://github.com/jamesgorman2/graphql-type-repository/issues).

## Issues

We use GitHub issues to track public bugs and requests. Please ensure your bug
description is clear and has sufficient instructions to be able to reproduce the
issue. The best way is to provide a reduced test case on jsFiddle or jsBin.

## Pull Requests

All active development of graphql-type-repository happens on GitHub. We actively welcome
your [pull requests](https://help.github.com/articles/creating-a-pull-request).

### Considered Changes

TBD

### Getting Started

1. Fork this repo by using the "Fork" button in the upper-right

2. Check out your fork

   ```sh
   git clone git@github.com:yournamehere/graphql-type-repository.git
   ```

3. Install or Update all dependencies

   ```sh
   yarn
   ```

4. Get coding! If you've added code, add tests. If you've changed APIs, update
   any relevant documentation or tests. Ensure your work is committed within a
   feature branch.

5. Ensure all tests pass

   ```sh
   npm test
   ```

### Live Feedback

While actively developing, we recommend running `npm run watch` in a terminal.
This will watch the file system run any relevant tests automatically whenever you save a `.js` file.
An editor like (Atom)[https://atom.io] can be set up to check eslint and flow
automatically using the `linter-eslint` and `linter-flow` packages.

## Coding Style

* [Yarn](https://yarnpkg.com/) is used to manage dependencies
* [Jest](https://facebook.github.io/jest/) is used for all testing.
* follow the eslint config
* 2 spaces for indentation (no tabs)
* 100 character line length strongly preferred
* Prefer `'` over `"`
* ES6 syntax when possible. However do not rely on ES6-specific functions to be available.
* Prefer immutable objects and continuation style for internal types
* Use [Flow types](http://flowtype.org/)
* Use semicolons;
* Trailing commas,
* Avd abbr wrds.

## Release on NPM

*Only core contributors may release to NPM.*

To release a new version on NPM, first ensure all tests pass with `npm test`,
then use `npm version patch|minor|major` in order to increment the version in
package.json and tag and commit a release. Then `git push && git push --tags`
this change so Travis CI can deploy to NPM. *Do not run `npm publish` directly.*
Once published, add [release notes](https://github.com/jamesgorman2/graphql-type-repository/tags).
Use [semver](http://semver.org/) to determine which version part to increment.

Example for a patch release:

```sh
npm test
npm version patch
git push --follow-tags
```

## License

By contributing to graphql-type-repository, you agree that your contributions will be
licensed under its BSD license.
