# HttpImportCreateResponse

This interface describes the response returned by `createImportJobs()`.

```typescript
interface HttpImportCreateResponse
```

**FIELDS:**

- **code** (*number*) -

    Specifies the HTTP API response code.

- **data.jobId** (*string*) -

    Specifies the created import job ID.

- **message** (*string*) -

    Specifies the response message.

## Example\{#example}

```javascript
const jobId = response.data.jobId;
```
