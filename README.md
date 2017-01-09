# generator-php

is a Yeoman generator for scaffolding PHP projects with an opinionated clean architecture.

## Main generator

The main generator creates the base project structure and setup:

* Directory structure
    ```
    |-- doc
    |   `-- dependencies.svg
    `-- src
        `-- <Project name>
            |-- Application
            |-- Domain
            |-- Infrastructure
            |-- Ports
            `-- Tests
    ```
* Composer setup
    ```
    composer.json
    ```
* PHPUnit setup
    ```
    phpunit.php
    phpunit.xml.dist
    ```
* Configuration files
    ```
    .editorconfig
    .gitattributes
    .gitignore
    .travis.yml
    LICENSE
    README.md
    ```

Furthermore, the main generator may call additional sub generators on request.

## Subgenerators

### Code Climate

```
.codeclimate.yml
```

The code climate test reporter is added as a composer dev dependency:

```
composer require codeclimate/php-test-reporter
```

The code climate repository token is added to the Travis CI configuration (`.travis.yml`):

```

addons:
    code_climate:
        repo_token: 9a18c09fbf809a5241ebe8f99da04c2e395055fbb9c43f3a62e8ad022a0db9d3
 ```
 
### Coveralls (code coverage)

The coveralls coverage data reporter is added as a composer dev dependency:

```
composer require satooshi/php-coveralls
```

Code coverage data submission is added to the Travis CI configuration

```
after_script:
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then php vendor/bin/coveralls -v; fi;'
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then vendor/bin/test-reporter; fi;'
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then wget https://scrutinizer-ci.com/ocular.phar; fi;'
  - bash -c 'if [ "$TRAVIS_PHP_VERSION" != "hhvm" ]; then php ocular.phar code-coverage:upload --format=php-clover build/logs/clover.xml; fi;'
```

### PHPMD (PHP Mess Detector)

```
phpmd.xml
```

### Scrutinizer

```
.scrutinizer.yml
```

### Read the docs

```
mkdocs.yml
doc/index.md
```

### PHPDox (API documentation)

```
phpdox.xml.dist
```
