---
title: "listImportJobs() | Node.js"
slug: /node/node/DataImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists import jobs submitted through the HTTP import job API. Use it to review job IDs, collection names, progress, and state. | Node.js"
type: docx
token: CdK7dr8pyo36PZxpGFKcrZsjnEf
sidebar_position: 8
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - listImportJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listImportJobs()

This operation lists import jobs submitted through the HTTP import job API. Use it to review job IDs, collection names, progress, and state.

```javascript
await milvusClient.listImportJobs(params: HttpImportListReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listImportJobs({
    collectionName: string,
    dbName?: string,
    projectId?: string,
    regionId?: string,
})
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    Specifies the target collection name.

- **dbName** (*string*) -

    Specifies the database name.

- **projectId** (*string*) -

    The ID of the Zilliz Cloud project. Optional.

- **regionId** (*string*) -

    The ID of the Zilliz Cloud region. Optional.

**RETURNS:**

*Promise&lt;HttpImportListResponse&gt;*

This method returns a promise that resolves to a **HttpImportListResponse** object.

**PARAMETERS:**

- **code** (*number*) -

    Specifies the HTTP API response code.

- **data.records** (*ImportJobType[]*) -

    Lists import jobs with collection name, job ID, progress, and state.

- **message** (*string*) -

    Specifies the response message.


**EXCEPTIONS:**

- **Error**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```javascript
const jobs = await milvusClient.listImportJobs({
    collectionName: 'my_collection',
    dbName: 'default',
});
```
