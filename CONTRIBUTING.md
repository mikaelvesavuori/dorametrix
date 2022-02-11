# General guidelines for contributing code

You are very welcome to contribute to the project! Pull requests welcome, as well as issues or plain messages.

Respect the below and I will be happy to merge your work and credit you for it.

## Style and structure

- Follow the style and conventions already in place. This project uses Typescript and attempts to do some sort of [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).
- _As always, write clean, easy-to-read code. Prefer being slightly more verbose and semantic than being "efficient" and terse_, if such a choice is necessary. Write as if someone is going to contribute on top of your code base tomorrow without knowing you or your work.
- Follow importing by highest-level components at top, and detail-oriented components at bottom. Example:

```
import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda';

import { QueryStringParams } from '../domain/interfaces/QueryStringParams';

import { UnknownKeyError } from '../domain/errors/UnknownKeyError';
```

1. External imports
2. Entities
3. Contracts
4. Interfaces
5. Use cases or other high-level files
6. Same-level files
7. Frameworks
8. Messages, errors, warnings (separated)

## Tests

- **Always include tests for additions or changes**. Aim for 100% coverage, but set a minimum bar to cover at least the main functionality. We should ideally have total code coverage of 95% or more. Your contribution will affect that score, so aim to keep it high(er)! :)
- It's encouraged to place any test data in the `testdata` folder.
- **Always check that all tests (including your new ones) are passing before making a pull request**.

## Error handling

- Make sure to handle errors and do any relevant validation logic. Also always output meaningful, actionable messages/warnings/errors to the user.
- Avoid inlining messages, errors or warnings. Instead place those in the dedicated files for each of the mentioned concerns, and read them from there.

## Documentation

- Document your code with JSDoc at the start of your code. Since the project uses Typescript, add "description" documentation; more than that is not needed.
- Add any inline comments as needed for anything that is not self-evident.
- Update the README with any user-facing changes, such as new CLI commands or arguments.
