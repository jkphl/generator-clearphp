# generator-php

is a Yeoman generator for scaffolding PHP projects with an opinionated implementation of clean architecture.

## Main generator

The main generator creates the base project structure and setup:

### Files & directories

```
|-- .editorconfig
|-- .gitattributes
|-- .gitignore
|-- .travis.yml
|-- CHANGELOG.md
|-- LICENSE
|-- README.md
|-- composer.json
|-- doc
|   `-- dependencies.svg
|-- phpunit.php
|-- phpunit.xml.dist
`-- src
  `-- <Project name>
      |-- Application
      |-- Domain
      |-- Infrastructure
      `-- Ports
```

### Composer setup

The default composer dependencies are:

* `php`

The default composer development dependencies are:

* `clue/graph-composer`

### Unit tests

If you enable Unit tests, the following resources are added:

```
|-- phpunit.php
|-- phpunit.xml.dist
`-- src
  `-- <Project name>
      `-- Tests
```

The following composer development dependencies are added:

* `phpunit/phpunit`

## Subgenerators

### Code Climate

If you enable [code climate](https://codeclimate.com) support (account needed), the following resources are added:

```
|-- .codeclimate.yml
`-- phpmd.xml
```

The following composer development dependencies are added:

* `codeclimate/php-test-reporter`

The following lines are added to the Travis CI configuration (`.travis.yml`):

```

addons:
    code_climate:
        repo_token: <CODE-CLIMATE-REPO-TOKEN-HERE>
 ```
 
### Scrutinizer

If you enable [scrutinizer](https://scrutinizer-ci.com/) support (account needed), the following resources are added:

```
`-- .scrutinizer.yml
```

Code coverage data submission to Scrutinizer is added to the Travis CI configuration (`.travis.yml`):

```
after_script:
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then wget https://scrutinizer-ci.com/ocular.phar; fi;'
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then php ocular.phar code-coverage:upload --format=php-clover build/logs/clover.xml; fi;'
```

 
### Code coverage

If you enable code coverage support ([Coveralls](https://coveralls.io/) account needed), the following composer development dependencies are added:

* `satooshi/php-coveralls`

Code coverage data submission to Coveralls is added to the Travis CI configuration (`.travis.yml`):

```
after_script:
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then php vendor/bin/coveralls -v; fi;'
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then vendor/bin/test-reporter; fi;'
```

### Documentation

If you enable documentation support ([Read the Docs](https://readthedocs.org/) account needed), the following resources are added:

```
|-- mkdocs.yml
`-- doc
    |-- index.md
    `-- todo.md
```

### API documentation

If you enable API documentation support (via phpDox), the following resources are added:

```
`-- phpdox.xml.dist
```

The following composer development dependencies are added:

* `theseer/phpdox`
* `phploc/phploc`
* `phpmd/phpmd`

```
vendor/bin/phploc.bat --count-tests --progress --log-xml build/phploc.xml src
vendor/bin/phpmd.bat src xml phpmd.xml --reportfile build/pmd.xml
vendor/bin/phpunit.bat
vendor/bin/phpdox.bat 
```
