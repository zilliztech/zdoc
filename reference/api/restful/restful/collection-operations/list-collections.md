---
displayed_sidebar: restfulSidebar
sidebar_position: 9
slug: /list-collections
title: List Collections
---

import RestHeader from '@site/src/components/RestHeader';

Lists collections in a cluster.

<RestHeader method="get" endpoint="https://{cluster-endpoint}/v1/vector/collections" />

---

## Example


:::info Notes

You can use either of the following ways to authorize:

- An [API Key](/docs/manage-api-keys) with appropriate permissions.
- A colon-joined username and password of the target cluster. For example, `username:p@ssw0rd`.

:::


```shell
curl --request GET \
    --url "${cluster-endpoint}/v1/vector/collections" \
    --header "Authorization: Bearer ${YOUR_TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json"
```

Sample response:

```shell
{
   code: 200,
   data: [
        "collection1",
        "collection2",
        ...
        "collectionN",
        ]
}
```


## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `dbName`  | **string**<br/>The name of the database|

- No path parameters required

### Request Body

No request body required

## Response

Returns a list of collections in the specified cluster.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": [
        {}
    ]
}
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
| `data`  | **array**<br/>A data array of strings. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 80000 | Incorrect parameter: xxx |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Cluster not exist or you don't have permission. |
| 80022 | Dedicated cluster not support this operation. |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |

