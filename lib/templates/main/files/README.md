# <%- vendor %>/<%- project %>

<% if(git) { %>[![Build Status][travis-image]][travis-url]<% } %> <% if(coverage) { %>[![Coverage Status][coveralls-image]][coveralls-url]<% } %> <% if(scrutinizer) { %>[![Scrutinizer Code Quality][scrutinizer-image]][scrutinizer-url]<% } %> <% if(codeclimate) { %>[![Code Climate][codeclimate-image]][codeclimate-url]<% } %> <% if(docs) { %>[![Documentation Status][readthedocs-image]][readthedocs-url]<% } %>

> <%- description %>

## Documentation

Please find the [project documentation](doc/index.md) in the `doc` directory.<% if(docs) { %> I recommend [reading it](http://<%- vendor %>-<%- project %>.readthedocs.io/) via *Read the Docs*.<% } %>

## Installation

This library requires PHP <%- php %> or later. I recommend using the latest available version of PHP as a matter of principle. It has no userland dependencies.

## Dependencies

![Composer dependency graph](https://rawgit.com/<%- vendor %>/<%- project %>/master/doc/dependencies.svg)

## Quality

To run the unit tests at the command line, issue `composer install` and then `phpunit` at the package root. This requires [Composer](http://getcomposer.org/) to be available as `composer`, and [PHPUnit](http://phpunit.de/manual/) to be available as `phpunit`.

This library attempts to comply with [PSR-1][], [PSR-2][], and [PSR-4][]. If you notice compliance oversights, please send a patch via pull request.

[PSR-1]: https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-1-basic-coding-standard.md
[PSR-2]: https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md
[PSR-4]: https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md

<% if(git) { %>[travis-image]: https://secure.travis-ci.org/<%- vendor %>/<%- project %>.svg
[travis-url]: https://travis-ci.org/<%- vendor %>/<%- project %>
<% } %><% if(coverage) { %>[coveralls-image]: https://coveralls.io/repos/<%- vendor %>/<%- project %>/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/<%- vendor %>/<%- project %>?branch=master
<% } %><% if(scrutinizer) { %>[scrutinizer-image]: https://scrutinizer-ci.com/g/<%- vendor %>/<%- project %>/badges/quality-score.png?b=master
[scrutinizer-url]: https://scrutinizer-ci.com/g/<%- vendor %>/<%- project %>/?branch=master
<% } %><% if(codeclimate) { %>[codeclimate-image]: https://scrutinizer-ci.com/g/<%- vendor %>/<%- project %>/badges/quality-score.png?b=master
[codeclimate-url]: https://scrutinizer-ci.com/g/<%- vendor %>/<%- project %>/?branch=master
<% } %><% if(docs) { %>[readthedocs-image]: https://readthedocs.org/projects/<%- vendor %>-<%- project %>/badge/?version=latest
[readthedocs-url]: http://<%- vendor %>-<%- project %>.readthedocs.io/en/latest/?badge=latest<% } %>