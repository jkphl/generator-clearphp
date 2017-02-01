# A Clear Architecture

In my experience, development approaches like [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design) and concepts like the [Hexagonal Architecture](http://alistair.cockburn.us/Hexagonal+architecture) or the [Onion Architecture](http://jeffreypalermo.com/blog/the-onion-architecture-part-1/) bear a lot of high-level wisdom but don't really provide practical guidance when it comes to putting a new project on the road. After several unsatisfactory experiments, I felt a sort of relief when I first read about the [Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html "The Clean Architecture by Bob Martin"), as it nicely aggregated some of the other concepts while simplifying things at the same time. However, I still missed a clear and easy-to-follow recipe for structuring my projects, for naming classes, files and directories and finding the best location for a particular functionality. So I came up with the **Clear Architecture**, a concrete and opinionated implementation of the Clean Architecture, which has proven useful in several projects in the meantime.  


## Key objectives

* Pragmatic, down-to-earth [Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html "The Clean Architecture by Bob Martin") implementation
* Reasonable balance between simplicity, usability, high-level concepts and abstractions
* Framework and delivery mechanism independence
* Suitable for libraries (used by other packages)

## Three-tier architecture

![DAPIT layers](https://rawgit.com/jkphl/generator-cleanphp/master/doc/dapit-layers.svg)

### Domain tier ("Policies")

* High-level business rules
* **Domain** objects

### Application tier ("Services")

* **Application** specific business rules / services
* Use cases orchestrating the domain objects
* Translating between external requests and domain logic (back and forth)

### Client tier ("Mechanisms")
* Public **ports** for external agencies (APIs, MVC, CLI, etc.)
* **Infrastructural** details (persistence, database, frameworks, 3rd party libraries)
* Unit, functional and integration **tests**  


## Directory layout

### Base skeleton

```
|-- doc
`-- src
    `-- <Module> 
        |-- Application
        |-- Domain
        |-- Infrastructure
        |-- Ports
        `-- Tests
```

* The top level directory `src` separates the actual program source files from other package resources, e.g. documentation files (`doc`). 
* `<Module>` *MUST* be replaced with a module name that is unique to the vendor, written in [UpperCamelCase] (e.g. `MyApp`).
* The 3rd level is made up of directories representing the architectural tiers and sectors.

## PHP specific considerations

* In a PHP implementation, [PSR-4] *MUST* be applied, with `<Module>` being the **base directory** corresponding to the **namespace prefix** (e.g. `Jkphl\MyApp`) as per [PSR-4].
* TODO: Deeper-lying directories (e.g. `Facade`, `Contract`, `Service`, `Factories` etc.) 

### Naming conventions

The following special elements (and their files) must be named after their role:

* Interfaces must use the **`Interface`** suffix (e.g. `MyCustomPurposeInterface`)
* Traits must use the **`Trait`** suffix (e.g. `MyCustomPurposeTrait`)
* Factories must use the **`Factory`** suffix (e.g. `MyCustomPurposeFactory`)

[RFC 2119]: http://tools.ietf.org/html/rfc2119
[UpperCamelCase]: https://en.wikipedia.org/wiki/Camel_case
[PSR-4]: http://www.php-fig.org/psr/psr-4/
