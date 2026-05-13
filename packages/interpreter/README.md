# Spec Interpreter

Interpreter and projection utilities for reviewed Spec interpretation
documents.

The first projection target is a serializable XState-compatible machine config.
The package does not execute XState machines yet.

The package bundles `schemas/interpretation.schema.json` so default validation
does not depend on files outside the package.

Run `npm --workspace @defx/spec-interpreter run validate -- <path>` to validate
an interpretation file with the package CLI.
