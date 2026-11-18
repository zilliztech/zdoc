---
title: "createImportJobs() | Node.js"
slug: /node/node/DataImport-createImportJobs
sidebar_label: "createImportJobs()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an HTTP import job from file groups. Use it after preparing files in object storage or another location accessible to the Milvus import service. | Node.js"
type: docx
token: PGmQdpQ8roiLJVxJSZrcbnAVn1e
sidebar_position: 1
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - createImportJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# createImportJobs()

This operation creates an HTTP import job from file groups. Use it after preparing files in object storage or another location accessible to the Milvus import service.

```javascript
await milvusClient.createImportJobs(params: HttpImportCreateReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.createImportJobs({
    collectionName: string,
    files: string[][],
    dbName?: string,
    projectId?: string,
    regionId?: string,
    options?: {
        timeout: string,
    },
})
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    Specifies the target collection name.

- **files** (*string[][]*) -

    **[REQUIRED]**

    Specifies file groups to import. Each inner array represents files that belong to one import group.

- **dbName** (*string*) -

    Specifies the database name.

- **projectId** (*string*) -

    The ID of the Zilliz Cloud project. Optional.

- **regionId** (*string*) -

    The ID of the Zilliz Cloud region. Optional.

- **options** (*object*) -

    Specifies import options such as timeout.

**RETURNS:**

*Promise&lt;HttpImportCreateResponse&gt;*

This method returns a promise that resolves to a **HttpImportCreateResponse** object.

**PARAMETERS:**

- **code** (*number*) -

    Specifies the HTTP API response code.

- **data.jobId** (*string*) -

    Specifies the created import job ID.

- **message** (*string*) -

    Specifies the response message.


**EXCEPTIONS:**

- **Error**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```javascript
const job = await milvusClient.createImportJobs({
    collectionName: 'book_embeddings',
    files: [['s3://bucket/book_embeddings/part-0001.parquet']],
});
```
