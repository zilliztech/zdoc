---
displayed_sidebar: restfulSidebar
sidebar_position: 16
slug: /restful/query
title: Query
---

import RestHeader from '@site/src/components/RestHeader';

Conducts a query on scalar fields in a collection.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v1/vector/query" />

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

### Request Body

```json
{
    "dbName": "string",
    "collectionName": "string",
    "partitionNames": [],
    "filter": "string",
    "limit": "integer",
    "offset": "integer",
    "outputFields": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database.  |
| __collectionName__ | string  <br/>The name of the collection to which this operation applies.  |
| __partitionNames__ | array<br/>The name of the partitions to which this operation applies. |
| __partitionNames[]__ | string  <br/>PartitionName  |
| __filter__ | string  <br/>The filter used to find matches for the search.  |
| __limit__ | integer  <br/>The maximum number of entities to return.<br/>The sum of this value and that of `offset` should be less than **16384**.<br/>The value defaults to 100<br/>The value ranges from 1 to 100.  |
| __offset__ | integer  <br/>The number of entities to skip in the search results.<br/>The sum of this value and that of `limit` should be less than **16384**.<br/>The value is less than or equal to 16384.  |
| __outputFields__ | array<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | string  <br/>  |

## Response

Returns the search results.

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

| __code__ | integer  <br/>  |
| __data__ | array<br/> |
| __data[]__ | object<br/> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 80000 | Incorrect parameter: xxx |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Cluster not exist or you don't have permission. |
| 90001 | The collection xxx does not exist. You can use ListCollections to view the list of existing collections. |
| 90002 | The return value property xxx does not exist on collection xxx. |
| 90004 | The parameter value for 'limit' should be between 1 and 100. |
| 90005 | The parameter value for 'offset' should not be less than 0. |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90110 | No filter key field. |
| 90134 | No query content provided. |
| 90139 | Type mismatch for field 'xxx'. expected type:xxx |
