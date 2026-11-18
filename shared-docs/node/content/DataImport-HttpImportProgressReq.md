# HttpImportProgressReq

This interface defines the request body for `getImportJobProgress()`.

```typescript
interface HttpImportProgressReq
```

**FIELDS:**

- **jobId** (*string*) -

    **[REQUIRED]**

    Specifies the import job ID.

- **dbName** (*string*) -

    Specifies the database name.

## Example\{#example}

```javascript
const request = {
    jobId: 'job-1234567890',
};
```
