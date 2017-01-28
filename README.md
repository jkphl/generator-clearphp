generator-cleanphp
==================
[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url] [![Dependency Status][depstat-image]][depstat-url] [![Development Dependency Status][devdepstat-image]][devdepstat-url]

is a Yeoman generator for scaffolding PHP projects following a custom implementation of clean architecture principles. During scaffolding, you can select from a variety of 3rd party tools and service intergrations.


Usage
-----

To **install the PHP project generator** and its dependencies, please run:

```bash
npm install -g yo generator-cleanphp
```

To **scaffold a new PHP project**, create a new directory, `cd` into it and run the generator:
  
```bash
mkdir vendorname-project
cd vendorname-project
yo cleanphp
```


Generators
----------

The generator consists of several subgenerators:
 
* [cleanphp](#app) (aka [cleanphp:app](#app))
* [cleanphp:main](#main)
* [cleanphp:github](#github)
* [cleanphp:codeclimate](#codeclimate)
* [cleanphp:coverage](#coverage)
* [cleanphp:scrutinizer](#scrutinizer)
* [cleanphp:docs](#docs)
* [cleanphp:apidocs](#apidocs)

The subgenerators partly depend on each other:

![Subgenerator dependencies](https://rawgit.com/jkphl/generator-cleanphp/master/doc/generator-dependencies.svg)

Each subgenerator will only run once and automatically pull in the other generators it depends on. You can run them individually at any time, using them as supplementary add-ons to your project. 


### app

The `cleanphp:app` subgenerator is basically a meta generator calling all of the other subgenerators.

```bash
yo cleanphp
```


### main

The `cleanphp:main` generator creates the base project structure and setup. During installation, you will be asked a couple of questions like the vendor and project name, the minimum PHP version and some information about the project author. Running

```bash
yo cleanphp:main
```

will scaffold these files and directories for you:

```
|-- .editorconfig
|-- .yo-rc.json
|-- CHANGELOG.md
|-- CONDUCT.md
|-- LICENSE
|-- README.md
|-- composer.json
|-- composer.lock
|-- doc
|-- phpunit.php
|-- phpunit.xml.dist
`-- src
    `-- <Project name> 
        |-- Application
        |-- Domain
        |-- Infrastructure
        |-- Ports
        `-- Tests

```


#### Files & directories

| File               | Description                                                                                                                                                                                                                                   |
|:-------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `.editorconfig`    | [Editorconfig](http://editorconfig.org) definitions file                                                                                                                                                                                      |
| `.yo-rc.json`      | Yeoman's configuration file where your answers are stored between generator runs. Don't edit this file by hand. However, if you're sure you'll never run any of the generators again, you can safely delete this file.                        |
| `CHANGELOG.md`     | Changelog of your project. Try to stick to [Keep a CHANGELOG](http://keepachangelog.com/) principles when adding entries.                                                                                                                     |
| `CONDUCT.md`       | Contributor Code of Conduct, adapted from the [Contributor covenant](http://contributor-covenant.org/version/1/4/) version 1.4.                                                                                                               |
| `LICENCE`          | The license you selected during installation.                                                                                                                                                                                                 |
| `README.md`        | The main README file of your project. Be aware that it might be amended and overwritten when you run additional subgenerators at a later time. However, you'll always have the chance to review the differences (if any) and skip the update. |
| `composer.json`    | The [Composer](https://getcomposer.org/) configuration of your project.                                                                                                                                                                       |
| `doc`              | This is the directory where your project documentation should reside. You can add some basic files with the [cleanphp:docs](#docs) generator.                                                                                                 |
| `phpunit.php`      | Bootstrap file for [PHPUnit](https://github.com/sebastianbergmann/phpunit) including the Composer autoloader.                                                                                                                                 |
| `phpunit.xml.dist` | [PHPUnit](https://github.com/sebastianbergmann/phpunit) configuration                                                                                                                                                                         |
| `src`              | Base directory for your PHP project files. [See below](#clean-architecture) for some words on the clean architecture principles proposed by the generator.                                                                                    |


#### Composer dependencies

* [phpunit/phpunit](https://github.com/sebastianbergmann/phpunit): Unit testing framework
* [clue/graph-composer](https://github.com/jkphl/graph-composer): Library for creating dependency graphs of your project


#### Scripts

##### Unit tests

You can run your [PHPUnit](https://github.com/sebastianbergmann/phpunit) unit tests by calling the Composer scripts

```bash
composer run phpunit
```

or

```bash
composer run test
```


##### Dependency graph

You can create a dependency graph of your project by running
  
```bash
composer run depgraph
```

This will create an SVG file like this:

![PHP project dependency graph (example)](https://rawgit.com/jkphl/generator-cleanphp/master/doc/dependency-graph.svg)

stored in the `doc` directory:

```
|-- doc
|   `-- dependencies.svg
```

By default, the dependency graph is embedded into the `README.md`. Unless you run the [cleanphp:github](#github) subgenerator you'll have to create and update the graph manually each time you change the Composer dependencies of your project. 


### github

The `cleanphp:github` subgenerator is an essential requirement for most other subgenerators and will connect your project to a Github repository.

```bash
yo cleanphp:github
```

The generator initializes a Git repository and adds some files:

```
|-- .git
|   `-- hooks
|       |-- post-commit
|       `-- pre-commit
|-- .gitattributes
|-- .gitignore
|-- .travis.yml
```

Please be aware that **the generator doesn't create a repository on Github** for you — you'll have to do that manually prior to running the generator. The generator will ask you for the Github repository URL. You can provide either the SSH or the HTTPS repository URL here.


#### Files & directories

| File                         | Description                                                                                                                                                                                            |
|:-----------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `.git`                       | The Git repository of your project                                                                                                                                                                     |
| `post-commit` / `pre-commit` | Git hooks that automatically recreates the [dependency graph](#dependency-graph) of your project whenever you commit an altered `composer.json` file.                                                  |
| `.gitattributes`             | Configuration file [assigning attributes to files](https://git-scm.com/docs/gitattributes).                                                                                                            |
| `.gitignore`                 | Specification which [files (not) to track](https://git-scm.com/docs/gitignore).                                                                                                                        |
| `.travis.yml`                | Configuration file for the [Travis CI Service](https://travis-ci.org/). For Travis to build your project on every commit, you have to manually activate the project repository in your Travis profile. |


### codeclimate

The `cleanphp:codeclimate` generator integrates the [Code Climate](https://codeclimate.com) 3rd party service (account needed):
 
```bash
yo cleanphp:codeclimate
```
 
It adds some configuration resources:

```
|-- .codeclimate.yml
|-- phpmd.xml
```


#### Files & directories

| File               | Description                                                                           |
|:-------------------|:--------------------------------------------------------------------------------------|
| `.codeclimate.yml` | [Code Climate](https://codeclimate.com) configuration file                            |
| `phpmd.xml`        | [PHP Mess Detector](https://phpmd.org/) configuration file (consumed by Code Climate) |


#### Composer dependencies

* [codeclimate/php-test-reporter](https://github.com/codeclimate/php-test-reporter): The test reporter used by Travis CI to send coverage data to the Code Climate service


#### Travis configuration

Among other things, the generator adds a Code Climate repository token to your Travis CI configuration file:

```yaml
after_script:
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then vendor/bin/test-reporter; fi;'
addons:
    code_climate:
        repo_token: <CODE-CLIMATE-REPO-TOKEN>
 ```

Please obtain this token prior to running the generator by

* adding your Github repository as a project to your Code Climate profile,
* go to `Settings > Test Coverage`,
* scroll down, display the Travis CI options and copy the 64-character `repo_token`.


### coverage

The `cleanphp:coverage` generator integrates the [Coveralls](https://coveralls.io/) 3rd party service (account needed):
 
```bash
yo cleanphp:coverage
```


#### Composer dependencies

* [satooshi/php-coveralls](https://github.com/satooshi/php-coveralls): PHP client for the Coveralls API


#### Travis configuration

The generator adds an `after_script` entry to your Travis CI configuration file, used for submitting code coverage data to Coveralls:

```yaml
after_script:
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then php vendor/bin/coveralls -v; fi;'
```


#### Coveralls configuration

You need to manually [activate the Github repository](https://coveralls.io/repos/new) in your Coveralls account settings.


### scrutinizer

The `cleanphp:scrutinizer` generator integrates the [Scrutinizer](https://scrutinizer-ci.com/) 3rd party service (account needed)

```bash
yo cleanphp:scrutinizer
```
 
It adds a single configuration resource:

```
|-- .scrutinizer.yml
```


#### Files & directories

| File               | Description                                                   |
|:-------------------|:--------------------------------------------------------------|
| `.scrutinizer.yml` | [Scrutinizer](https://scrutinizer-ci.com/) configuration file |


#### Travis configuration

The generator adds two `after_script` entries to your Travis CI configuration file, used for submitting code coverage data to Scrutinizer:

```yaml
after_script:
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then wget https://scrutinizer-ci.com/ocular.phar; fi;'
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then php ocular.phar code-coverage:upload --format=php-clover build/logs/clover.xml; fi;'
```

 
#### Scrutinizer configuration

You need to manually [add your Github repository](https://scrutinizer-ci.com/new) to your Scrutinizer account. 


### docs

The `cleanphp:docs` generator enables the [Read the Docs](https://readthedocs.org/) 3rd party service to render a documentation of your project resources (account needed):
 
```bash
yo cleanphp:docs
```
 
It adds some configuration and example documentation resources:

```
|-- doc
|   |-- index.md
|   `-- todo.md
|-- mkdocs.yml
```


#### Files & directories

| File                   | Description                                                                 |
|:-----------------------|:----------------------------------------------------------------------------|
| `index.md` / `todo.md` | Basic documentation example files                                           |
| `mkdocs.yml`           | [MkDocs](http://www.mkdocs.org/) configuration file (used by Read the Docs) |


#### Read the Docs / MkDocs configuration

To render an online documentation of your project, you have to

* create an account with [Read the Docs](https://readthedocs.org/),
* [import and configure your Github respository](https://readthedocs.org/dashboard/import/) as a new project and
* [add some pages](http://www.mkdocs.org/#adding-pages) to your documentation configuration `mkdocs.yml` (see the default configuration for a basic example).


### API documentation

The `cleanphp:apidocs` generator installs some tools which can automatically create a rich API documentation of your project (requires PHP 5.6+):

```bash
yo cleanphp:apidocs
```
 
It adds a single configuration resource:

```
|-- build
|-- phpdox.xml.dist
```


#### Files & directories

| File              | Description                                                             |
|:------------------|:------------------------------------------------------------------------|
| `build`           | Directory for temporary files needed during API documentation creation. |
| `phpdox.xml.dist` | [phpDox](http://phpdox.de/) configuration file                          |


#### Composer dependencies

* [theseer/phpdox](https://github.com/theseer/phpdox): Documentation generator for PHP Code
* [phploc/phploc](https://github.com/sebastianbergmann/phploc): A tool for quickly measuring the size of a PHP project
* [phpmd/phpmd](https://github.com/phpmd/phpmd): [PHP Mess Detector](https://phpmd.org/)


#### Scripts

##### apidocs

The generator configures a couple of Composer scripts needed for API documentation creation: 

* `phploc`: Collect project size data
* `phpmd`: Run PHP Mess Detector on your project and prepare its analysis data
* `phpdox`: Create the API documentation
* `build`: Run the `phploc`, `phpmd`, `phpunit` and `phpdox` scripts in a row.

While you can call the scripts individually, you will most likely want to run the `build` script to create your API documentation.

```bash
composer run build
```

Your documentation will be rendered to the directory `apidocs` (will be created if necessary). Please be aware that the API documentation creation will fail until you don't have created any PHP files in your project.

To use the scripts on the Windows platform, you will have to edit the `scripts` section of your `composer.json` manually and add a `.bat` file extension to all `vendor/bin/*` scripts.


Clean Architecture
------------------


Known problems / To-do
----------------------

Currently there are no known problems.


Changelog
---------

Please refer to the [changelog](CHANGELOG.md) for a complete release history.


Legal
-----
Copyright © 2017 Joschi Kuphal <joschi@kuphal.net> / [@jkphl](https://twitter.com/jkphl). *generator-cleanphp* is licensed under the terms of the [MIT license](LICENSE.txt).


[npm-url]: https://npmjs.org/package/generator-cleanphp
[npm-image]: https://badge.fury.io/js/generator-cleanphp.svg
[npm-downloads]: https://img.shields.io/npm/dm/generator-cleanphp.svg
[depstat-url]: https://david-dm.org/jkphl/generator-cleanphp#info=dependencies
[depstat-image]: https://david-dm.org/jkphl/generator-cleanphp.svg
[devdepstat-url]: https://david-dm.org/jkphl/generator-cleanphp#info=devDependencies
[devdepstat-image]: https://david-dm.org/jkphl/generator-cleanphp/dev-status.svg
