---
displayed_sidebar: restfulSidebar
sidebar_position: 56
slug: /restful/release-collection-v2
title: Release Collection
---

import RestHeader from '@site/src/components/RestHeader';

This operation releases the data of the current collection from memory.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/collections/release" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/collections/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "quick_setup"
}'
```
Possible response is similar to the following:
```json
{
    "code": 0,
    "data": {}
}
```



## Request

### Parameters

- No query parameters required

- No path parameters required

### Request Body

```json
{
    "dbName": "string",
    "collectionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database to which the cpllection belongs.<br/>Setting this to a non-existing database results in a **MilvusException**.  |
| __collectionName__ | string  <br/>The name of the target colletion.<br/>Setting this to a non-existing collection results in a **MilvusException**.  |

## Response

None

### Response Bodies

- Response body if we process your request successfully

```json
{}
```

- Response body if we failed to process your request

```json
{
    "code": integer,
    "message": string
}
```

### Properties

The properties in the returned response are listed in the following table.

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `code`   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |

| `message`  | **string**<br/>Indicates the possible reason for the reported error. |
