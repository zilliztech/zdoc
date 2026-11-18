# HttpImportListResponse

This interface describes the response returned by `listImportJobs()`.

```typescript
interface HttpImportListResponse
```

**FIELDS:**

- **code** (*number*) -

    Specifies the HTTP API response code.

- **data.records** (*ImportJobType[]*) -

    Lists import jobs with collection name, job ID, progress, and state.

- **message** (*string*) -

    Specifies the response message.

## Example\{#example}

```javascript
const records = response.data.records;
```
