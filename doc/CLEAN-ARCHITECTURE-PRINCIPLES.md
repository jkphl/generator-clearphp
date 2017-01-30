# Key objectives

* Pragmatic, down-to-earth [Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html "The Clean Architecture by Bob Martin") implementation
* No frameworks or delivery mechanism dependencies
* Suitable for libraries (to be used by other packages)

# Three-tier architecture ("PSM layers") 

![DAPIT layers](https://rawgit.com/jkphl/generator-cleanphp/master/doc/dapit-layers.svg)

## Domain tier ("Policies")

* **D**omain logic / high-level business rules
* Business objects

## Application tier ("Services")

* **A**pplication specific business rules / services
* Use cases orchestrating the domain objects
* Translating between external requests and domain logic (back and forth)

## Client tier ("Mechanisms")
* Public **p**orts for external agencies (APIs, MVC, etc.)
* **I**nfrastructural details (persistence / database, frameworks, 3rd party libraries)
* Unit, functional and integration **t**ests  


# Directory layout



# Naming conventions

The following special elements (and their files) must be named after their role:

* Interfaces must use the suffix **`Interface`** (e.g. `MyCustomPurposeInterface`)
* Traits must use the suffix **`Trait`** (e.g. `MyCustomPurposeTrait`)
