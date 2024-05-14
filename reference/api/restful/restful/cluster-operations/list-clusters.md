---
displayed_sidebar: restfulSidebar
sidebar_position: 2
slug: /restful/list-clusters
title: List Clusters
---

import RestHeader from '@site/src/components/RestHeader';

Lists all clusters in the specified cloud region.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/clusters" />

---

## Example


:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

:::

```shell
curl --request GET \
    --url "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters?pageSize=&current=" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json"
```

Success response:

```shell
{
    "code": 200,
    "data": {
       "count": 0,
       "currentPage": 1,
       "pageSize": 10,
       "clusters": []
    }
}
```


## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `pageSize`  | **integer**<br/>The number of records to return on each page.|
    | `current`  | **integer**<br/>The current page number.|

- No path parameters required

### Request Body

No request body required

## Response

Returns a list of your clusters.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "count": "integer",
        "currentPage": "integer",
        "pageSize": "integer",
        "clusters": [
            {
                "clusterId": "string",
                "clusterName": "string",
                "description": "string",
                "regionId": "string",
                "clusterType": "string",
                "cuSize": "integer",
                "status": "string",
                "connectAddress": "string",
                "privateLinkAddress": "string",
                "createTime": "string"
            }
        ]
    }
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
| __code__ | integer  <br/>  |
| __data__ | object<br/> |
| __data.count__ | integer  <br/>The total number of clusters returned.  |
| __data.currentPage__ | integer  <br/>The current page in the results.  |
| __data.pageSize__ | integer  <br/>The number of clusters per page in the results.  |
| __data[].clusters__ | array<br/>An array of clusters in detail. |
| __data[].clusters[]__ | object<br/> |
| __data[].clusters[].clusterId__ | string  <br/>The ID of the cluster.  |
| __data[].clusters[].clusterName__ | string  <br/>The name of the cluster.  |
| __data[].clusters[].description__ | string  <br/>An optional description about the cluster.  |
| __data[].clusters[].regionId__ | string  <br/>The ID of the region where the cluster exists.  |
| __data[].clusters[].clusterType__ | string  <br/>The type of CU associated with the cluster. Possible values are **Performance-optimized** and **Capacity-optimized**.  |
| __data[].clusters[].cuSize__ | integer  <br/>The size of the CU associated with the cluster.  |
| __data[].clusters[].status__ | string  <br/>The current status of the cluster. Possible values are **INITIALIZING**, **RUNNING**, **SUSPENDING**, and **RESUMING**.  |
| __data[].clusters[].connectAddress__ | string  <br/>The public endpoint of the cluster. You can connect to the cluster using this endpoint from the public network.  |
| __data[].clusters[].privateLinkAddress__ | string  <br/>The private endpoint of the cluster. You can set up a private link to allow your VPS in the same cloud region to access your cluster.  |
| __data[].clusters[].createTime__ | string  <br/>The time at which the cluster has been created.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80003 | The parameter value for 'pageSize' should be between 5 and 100. |
| 80004 | The parameter 'currentPage' should have a value between 1 and the maximum value of Int. |
| 90117 | Invalid domain name used |
