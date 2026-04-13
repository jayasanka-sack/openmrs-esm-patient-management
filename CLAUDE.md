# OpenMRS Frontend Guidelines

## Pull Request Requirements

### Title Format
PR titles must follow this exact format: `(label) TICKET-NO: Title goes here`

- Example: `(chore) O3-443: Upgrade dependencies`
- Allowed labels: `BREAKING`, `feat`, `fix`, `chore`, `docs`, `test`
- Pattern: `^\((BREAKING|feat|fix|chore|docs|test)\) [A-Z0-9]+-\d+: .+`
- The label must reflect the nature of the changes:
  - `BREAKING` — introduces breaking changes
  - `feat` — adds a new user-facing feature
  - `fix` — fixes a bug
  - `chore` — maintenance, dependencies, tooling, refactoring
  - `docs` — documentation only changes
  - `test` — adds or updates tests only

### Description Requirements
- Must include a link to the related ticket from either:
  - https://issues.openmrs.org/
  - https://openmrs.atlassian.net/jira/
- Must have a meaningful description explaining what changed, why, and any relevant context
