---
displayed_sidebar: restfulSidebar
sidebar_position: 23
slug: /restful/create-import-jobs-v2
title: Create import Jobs
---

import RestHeader from '@site/src/components/RestHeader';

This operation imports the prepared data files to a Milvus instance. To learn how to prepare your data files, read [Prepare Data Import](https://milvus.io/docs/prepare-source-data.md).

<RestHeader method="post" endpoint="https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/jobs/import/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "files": [
        [
            "/d1782fa1-6b65-4ff3-b05a-43a436342445/1.json"
        ],
        [
            "/2a12dea7-2eff-4b34-97b6-9554063fd791/1/id.npy",
            "/2a12dea7-2eff-4b34-97b6-9554063fd791/1/vector.npy",
            "/2a12dea7-2eff-4b34-97b6-9554063fd791/1/$meta.npy"
        ],
        [
            "/a6fb2d1c-7b1b-427c-a8a3-178944e3b66d/1.parquet"
        ]
    ],
    "collectionName": "quick_setup"
}'
```
Possible response is similar to the following
```json
{
    "code": 0,
    "data": {
        "jobId": "448707763884413158"
    }
}
```



## Request

### Parameters

- No query parameters required

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation.
Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.|
    | __Authorization__  | **string**<br/>The authentication token.|

### Request Body

```json
{
    "collectionName": "string",
    "files": [],
    "options": {
        "timeout": "string"
    }
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the target collection.<br/>Setting this to a non-existing collection results in an error.  |
| __files__ | __array__<br/>The files that contain the data to import. The files should reside within the Milvus bucket on the MinIO instance deployed along with your Milvus instance. |
| __files[]__ | __array__<br/>A sub-list that contains a single JSON or Parquet file, or a set of NumPy files. |
| __files[][]__ | __string__  <br/>A list of file paths, relative to the root of your Milvus bucket on the MinIO instance shipped along with the Milvus instance.  |
| __options__ | __object__<br/>Bulk-import options. |
| __options.timeout__ | __string__  <br/>The timeout duration of the created import jobs. The value should be a positive number suffixed by __s__ (seconds), __m__ (minutes), and __h__(hours). For example, _300s_, _1.5h_, and _1h45_ are all valid values.  |

## Response

The ID of the bulk-import job.

### Response Body

```json
{
    "code": "integer",
    "data": [
        {
            "jobID": "string"
        }
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/> |
| __data[]__ | __object__<br/> |
| __data[].jobID__ | __string__  <br/>The ID of the current bulk-import job.  |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

