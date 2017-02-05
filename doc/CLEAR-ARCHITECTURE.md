# A Clear Architecture

In my experience, development approaches like [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design) and structural concepts as the [Hexagonal Architecture](http://alistair.cockburn.us/Hexagonal+architecture) or the [Onion Architecture](http://jeffreypalermo.com/blog/the-onion-architecture-part-1/) bear a lot of wisdom but don't necessarily provide practical guidance when it comes to starting off with a new project. After several unsatisfactory experiments, I felt a sort of relief when I first read about the [Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html "The Clean Architecture by Bob Martin"), which nicely aggregates some high-level concepts while simplifying things at the same time. However, even the Clean Architecture doesn't provide a simple-to-follow recipe for layouting a project, naming classes, files and directories and deciding where to settle a particular functionality. So I trial-and-errored myself to the point where I had a rather concise, opinionated implementation of the Clean Architecture that prove useful in several projects, also in combination with each other. I call it **The Clear Architecture**.  


## Key objectives

* Pragmatic, down-to-earth architecture with a fixed base layout and a concise set of rules and conventions
* Reasonable balance of simplicity, usability, abstraction and high-level concepts
* Independence of frameworks and delivery mechanisms
* Suitable for building libraries (to be included by other packages)


## Three-tier architecture

<img src="https://rawgit.com/jkphl/generator-cleanphp/master/doc/clear-architecture-domain-application-client-tiers.svg" alt="Clear Architecture tiers" align="right" width="50%"/>

### ① Domain tier

* **Domain** objects
* High-level business rules

### ② Application tier

* **Application** specific business rules / services
* Use cases orchestrating the domain objects
* Translating between external requests and domain logic (back and forth)

### ③ Client tier (3 sectors)

* Public **ports** for external agencies (APIs, MVC, CLI, etc.)
* **Infrastructural** details (persistence, database, framework & 3rd party library bindings)
* Unit, functional and integration **tests**  


## Rules

### The Dependency rule

<img src="https://rawgit.com/jkphl/generator-cleanphp/master/doc/clear-architecture-dependency-rule.svg" alt="Clear Architecture tiers" align="right" width="50%"/>

In the Clear Architecture, source code dependencies may **only ever point to an inward or the same tier**.

> Nothing in an inner circle can know anything at all about something in an outer circle. In particular, the name of something declared in an outer circle must not be mentioned by the code in the an inner circle. That includes, functions, classes. variables, or any other named software entity.
> *[The Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html), Bob Martin*




## Directory layout

### Base skeleton

```
`-- src
    `-- <Module> 
        |-- Application
        |-- Domain
        |-- Infrastructure
        |-- Ports
        `-- Tests
```

* The top level directory `src` separates the actual program source files from other package resources, e.g. documentation, configuration, 3rd party libraries etc. 
* `<Module>` must be replaced with a vendor-unique module name written in [UpperCamelCase] (e.g. `MyApp`).
* The 3rd level is made up of directories representing the architectural tiers and sectors.

### Application specific structure

* TODO: Deeper-lying directories (e.g. `Facade`, `Contract`, `Service`, `Factories` etc.) 
___

## Considerations for PHP implementations

* In a PHP implementation, [PSR-4] must be applied, with `<Module>` being the **base directory** corresponding to the **namespace prefix** (e.g. `Jkphl\MyApp`) as per [PSR-4].


### Naming conventions

The following special elements (and their files) must be named after their role:

* Interfaces must use the **`Interface`** suffix (e.g. `MyCustomPurposeInterface`)
* Traits must use the **`Trait`** suffix (e.g. `MyCustomPurposeTrait`)
* Factories must use the **`Factory`** suffix (e.g. `MyCustomPurposeFactory`)

[UpperCamelCase]: https://en.wikipedia.org/wiki/Camel_case
[PSR-4]: http://www.php-fig.org/psr/psr-4/
