---
displayed_sidebar: restfulSidebar
sidebar_position: 55
slug: /restful/query
title: Query
---

import RestHeader from '@site/src/components/RestHeader';

Conducts a query on scalar fields in a collection.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v1/vector/query" />

---

## Example




:::info Notes

You can use either of the following ways to authorize:

- An [API Key](/docs/manage-api-keys) with appropriate permissions.
- A colon-joined username and password of the target cluster. For example, `username:p@ssw0rd`.

Currently, data of the JSON and Array types are not supported in RESTful API requests..
:::


Query entities that meet specific conditions. For details on how to build filters, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md#Boolean-Expression-Rules).

```shell
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/query" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
      "collectionName": "medium_articles",
      "outputFields": ["id", "title", "link"],
      "filter": "id in [443300716234671427, 443300716234671426]",
      "limit": 100,
      "offset": 0
    }'
```

:::info Notes

When setting `outputFields` to `count(\*)`, you need to set `limit` to `0` to get the total count of entities that meet the specified conditions.

:::




## Request

### Parameters

- No query parameters required

- No path parameters required

- No header parameters required

### Request Body

```json
{
    "collectionName": "string",
    "filter": "string",
    "limit": "integer",
    "offset": "integer",
    "outputFields": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __filter__ | __string__  <br/>The filter used to find matches for the search.  |
| __limit__ | __integer__  <br/>The maximum number of entities to return.<br/>The sum of this value and that of `offset` should be less than **16384**.<br/>The value defaults to 100<br/>The value ranges from 1 to 100.  |
| __offset__ | __integer__  <br/>The number of entities to skip in the search results.<br/>The sum of this value and that of `limit` should be less than **16384**.<br/>The value is less than or equal to 16384.  |
| __outputFields__ | __array__<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | __string__  <br/>  |

## Response

Returns the search results.

### Response Body

```json
{
    "code": "integer",
    "data": [
        {}
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/> |
| __data[]__ | __object__<br/> |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

