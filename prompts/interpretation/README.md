# Interpretation Prompts

These prompts support AI-assisted interpretation of canonical Spec parser AST
output.

They are process artifacts, not schema definitions. They may evolve faster than
`schemas/interpretation.schema.json`.

Current prompts:

* `extract-interpretation.md`: produce a conservative state-machine
  interpretation from parser AST JSON

## Manual Validation

To validate an extraction prompt revision:

1. Generate canonical parser AST JSON from a `.spec` file.
2. Paste `extract-interpretation.md` into an LLM.
3. Paste `schemas/interpretation.schema.json` after the prompt.
4. Paste the AST JSON after the schema.
5. Copy the returned YAML from the code block and save only the YAML body to a
   scratch file.
6. Confirm the YAML parses.
7. Validate the result against `schemas/interpretation.schema.json`.
8. Run structural reference checks:
   * `model.initial` exists in `model.states`
   * transition `from` and `to` states exist
   * transition `event` values exist in `model.events`
   * referenced facts exist in `model.facts`
   * invariants use structured `when` and `assert` conditions
9. Compare the result against the relevant checked-in example. It does not need
   to be identical, but it should make similar modelling choices or explicitly
   record the difference as an ambiguity.
