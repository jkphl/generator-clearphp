# A Clear Architecture

In my experience, development approaches like [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design) and structural concepts as the [Hexagonal Architecture](http://alistair.cockburn.us/Hexagonal+architecture) or the [Onion Architecture](http://jeffreypalermo.com/blog/the-onion-architecture-part-1/) carry a lot of wisdom but don't necessarily provide practical guidance when it comes to starting off with a new project. After several unsatisfactory experiments, I felt a sort of relief when I first read about the [Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html "The Clean Architecture by Bob Martin"), which nicely aggregates some high-level concepts while simplifying things at the same time. However, even the Clean Architecture doesn't provide a simple-to-follow recipe for layouting a project, naming classes, files and directories and deciding where to settle a particular functionality. So I trial-and-errored myself to the point where I had a rather concise, opinionated implementation of the Clean Architecture that prove useful in several projects, even and especially in combination with each other. Le me introduce you to the **Clear Architecture**.  

*Note: I won't go into too much detail regarding the various high-level concepts but rather focus on the practical side of things. Please see at the end for a list of readings I recommend for further understanding. Also, while I mainly use the Clear Architecture for PHP projects, it should be easily adoptable to other environments as well. Please let me know if you succeed (or fail) in doing so.*


## Key objectives

* Pragmatic, down-to-earth architecture with a fixed base layout and a concise set of rules and conventions
* Reasonable balance of simplicity, usability, abstraction and high-level concepts
* Independence of frameworks and delivery mechanisms
* Suitable for building libraries (to be included by other packages)


## Three-tier architecture

<img src="https://cdn.rawgit.com/jkphl/generator-cleanphp/3306407b/doc/clear-architecture-domain-application-client-tiers.svg" alt="Clear Architecture tiers" align="right" width="50%"/>

### ① Domain tier

* **Domain** objects & services
* High-level business rules

> In a banking application, the domain layer holds definitions of a bank account, an account holder, a currency etc. as well as their relationships with each other.

### ② Application tier

* **Application** specific business rules & services
* Use cases orchestrating domain objects & services
* Translating between external requests and domain logic (back and forth)

> The application layer provides a currency exchange service, executes different types of bank transactions and so on.  

### ③ Client tier (3 sectors)

* Low-level implementation details and mechanisms
* Public **ports** for external agencies (APIs, CLI, MVC components, etc.)
* **Infrastructural** details (persistence, database, frameworks, 3rd party library bindings)
* Unit, functional and integration **tests**

> The client layer implements the persistence infrastructure (e.g. a database), provides a web interface for browser based online banking as well as a [FinTS](https://en.wikipedia.org/wiki/FinTS) port to be used by external applications. Also, it holds and runs a suite of tests — highly specialized clients — as a means of overall quality assurance.


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

* The top level directory `src` separates the actual source files from other package resources, e.g. documentation, configuration files, 3rd party libraries etc. 
* `<Module>` must be replaced with a vendor-unique module name in [UpperCamelCase] writing (e.g. `MyApp`).
* The 3rd level is made up of five directories representing the main architectural tiers and sectors (see above).

### Application specifics

Inside the five main directories, your application may add additional structures as needed. However, to keep things consistent, I recommend sticking to these conventions:

* Directory and file names are always to be written in **UpperCamelCase**. I prefer using singular expressions wherever possible (i.e. `Factory` instead of `Factories`).
* If you have **multiple similar components, that are mostly used by external agents** (e.g. on a lower architectural level or by an external package), **keep them at a common central location**. As an example, I typically use directories named `Facade`, `Contract`, `Service` or `Factory` for grouping classes with similar functionality.
* **Keep closely related components together**. If you have, for instance, a class definition that implements an interface as described in [The Dependency Inversion Principle](#the-dependency-inversion-principle), put them into the same directory instead of spreading them across the file system. This rule commonly outweighs the previous one — it might be a matter of personal taste in some situations though.
* If a lower architectural layer "mirrors" and extends the structure of a higher one, e.g. by providing concrete implementations of interfaces defined on the higher level, **stick to the same directory and file names** as much as possible. This will help with keeping the cross-boundary relationships in mind.


## Rules & Conventions

<img src="https://cdn.rawgit.com/jkphl/generator-cleanphp/3306407b/doc/clear-architecture-dependency-rule.svg" alt="Clear Architecture tiers" align="right" width="50%"/>

### The Dependency Rule

In the Clear Architecture, source code dependencies may **only ever point to the same or an inward layer**.

> Nothing in an inner circle can know anything at all about something in an outer circle. In particular, the name of something declared in an outer circle must not be mentioned by the code in an inner circle. That includes, functions, classes, variables or any other named software entity. (*[The Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html), Robert C. Martin*)

Valid inward cross-boundary dependencies include:

* Constructing instances of classes defined in enclosed layers
* Implementing interfaces, using traits etc.
* Calling functions and methods
* Using classes, interfaces etc. for [typing](https://en.wikipedia.org/wiki/Type_system)

Strictly adhering to the Dependency Rule makes your application highly testable and very flexible in terms of implementation details (choice of a database platform or persistence strategy, client APIs etc.).

### The Dependency Inversion Principle

In order to not violate the Dependency Rule, the [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle) must be used whenever complex data needs to be passed to an inward layer. Instead of expecting and directly referencing a lower-level component (e.g. as function parameter), a layer only provides and references an interface that needs to be implemented by the caller. This way, the conventional dependency relationship in inverted and the high-level layer doesn't depend on lower-level ones.

![Dependency inversion by using an interface / abstract service class](https://cdn.rawgit.com/jkphl/generator-cleanphp/4b0317a9/doc/clear-architecture-dependency-inversion.svg)


### Naming conventions

The following special elements (including their files) must be named after their role:

* Interfaces must use the **`Interface`** suffix (e.g. `MyCustomInterface`)
* Traits must use the **`Trait`** suffix (e.g. `MyCustomTrait`)
* Factories must use the **`Factory`** suffix (e.g. `MyCustomPurposeFactory`)

___

## Considerations for PHP implementations

* In a PHP implementation, [PSR-4] should be applied, with `<Module>` being the **base directory** corresponding to the **namespace prefix** (e.g. `Jkphl\MyApp`) as per [PSR-4].
* I very much recommend using [Composer](https://getcomposer.org "Composer — Dependency Manager for PHP") as the principal dependency manager for your projects. By default, Composer will install all package dependencies into the `vendor` top-level directory. 


## Recommendations

* [Clean Architecture in PHP](https://leanpub.com/cleanphp) by Kristopher Wilson
* [Domain-Driven Design in PHP](https://leanpub.com/ddd-in-php) by Carlos Buenosvinos et al.

[UpperCamelCase]: https://en.wikipedia.org/wiki/Camel_case
[PSR-4]: http://www.php-fig.org/psr/psr-4/
