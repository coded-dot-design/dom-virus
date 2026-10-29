# Generated content model

Everything in this folder is generated and checked by `npm run validate:content` (CI).
Do not edit by hand: a hand edit fails the gate. Change the source and regenerate.

- `games/`, `brands/`, `posts/`, `pages/`: one stamped JSON per entry (`data`, lifecycle `status`, `relations`).
- `_contract/`: the schemas and the validator the gate runs.
