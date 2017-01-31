# The Clear Architecture

To illustrate the Clear Architecture principles, an implementation in PHP will used. However, the example should be easily translatable to a variety of other programming language.

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in [RFC 2119].

## Key objectives

* Pragmatic, down-to-earth [Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html "The Clean Architecture by Bob Martin") implementation
* Reasonable balance between simplicity, usability, high-level concepts and abstractions
* Frameworks and delivery mechanism independence
* Suitable for libraries (used by other packages)

## Three-tier architecture

![DAPIT layers](https://rawgit.com/jkphl/generator-cleanphp/master/doc/dapit-layers.svg)

### Domain tier ("Policies")

* High-level business rules
* **D**omain objects

### Application tier ("Services")

* **A**pplication specific business rules / services
* Use cases orchestrating the domain objects
* Translating between external requests and domain logic (back and forth)

### Client tier ("Mechanisms")
* Public **p**orts for external agencies (APIs, MVC, CLI, etc.)
* **I**nfrastructural details (persistence, database, frameworks, 3rd party libraries)
* Unit, functional and integration **t**ests  


## Directory layout  

* The top level `src` directory is used to separate the actual program source files from other package resources, e.g. documentation files. 
* `<Module>` *MUST* be replaced with a vendor specific module name written in [UpperCamelCase] (e.g. `MyApp`).
* The third level represents the architectural tiers respectively their subsectors.

```
`-- src
    `-- <Module> 
        |-- Application
        |-- Domain
        |-- Infrastructure
        |-- Ports
        `-- Tests
```

* In a PHP implementation, [PSR-4] *MUST* be applied, with `<Module>` being the **base directory** corresponding to the **namespace prefix** (e.g. `Jkphl\MyApp`) as per [PSR-4].
* TODO: Deeper-lying directories (e.g. `Facade`, `Contract`, `Service`, `Factories` etc.) 

## Naming conventions

The following special elements (and their files) must be named after their role:

* Interfaces must use the **`Interface`** suffix (e.g. `MyCustomPurposeInterface`)
* Traits must use the **`Trait`** suffix (e.g. `MyCustomPurposeTrait`)
* Factories must use the **`Factory`** suffix (e.g. `MyCustomPurposeFactory`)

[RFC 2119]: http://tools.ietf.org/html/rfc2119
[UpperCamelCase]: https://en.wikipedia.org/wiki/Camel_case
[PSR-4]: http://www.php-fig.org/psr/psr-4/
