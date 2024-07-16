---
displayed_sidebar: restfulSidebar
sidebar_position: 26
slug: /restful/list-clusters-v2
title: List Clusters
---

import RestHeader from '@site/src/components/RestHeader';

List all clusters scoped to API Key.

import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

<RestHeader method="get" endpoint="https://api.cloud.zilliz.com/v2/clusters" />

---

## Example



```shell
export API_KEY=""

curl --request GET \
    --url "https://api.cloud.zilliz.com/v2/clusters" \
    --header "Authorization: Bearer ${API_KEY}"   \
    --header "accept: application/json"
```

Possible response is similar to the following
```json
{
  "code": 0,
  "data": {
    "count": 1,
    "currentPage": 1,
    "pageSize": 10,
    "clusters": [
      {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "clusterName": "dedicated-3",
        "description": "",
        "regionId": "aws-us-west-2",
        "plan": "Standard",
        "cuType": "Performance-optimized",
        "cuSize": 1,
        "status": "RUNNING",
        "connectAddress": "https://inxx-xxxxxxxxxxxxxxx.aws-us-west-2.vectordb.zillizcloud.com:19530",
        "privateLinkAddress": "",
        "createTime": "2024-06-30T16:49:50Z",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx"
      }
    ]
  }
}
```



## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __pageSize__  | **integer**<br/>The number of records to include in each response.|
    | __currentPage__  | **integer**<br/>The current page number.|

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**(required)<br/>|
    | __Accept__  | **string**<br/>|

### Request Body

No request body required

## Response

Return a list of clusters in detail.

### Response Body

```json
{
    "code": "integer",
    "data": [
        {
            "clusterId": "string",
            "clusterName": "string",
            "description": "string",
            "regionId": "string",
            "plan": "string",
            "cuType": "string",
            "cuSize": "integer",
            "status": "string",
            "connectAddress": "string",
            "privateLinkAddress": "string",
            "projectId": "string",
            "createTime": "string"
        }
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/>Response payload. |
| __data[]__ | __object__<br/>List of clusters in detail. |
| __data[].clusterId__ | __string__  <br/>ID of a cluster.  |
| __data[].clusterName__ | __string__  <br/>Name of the cluster.  |
| __data[].description__ | __string__  <br/>Description of the cluster.  |
| __data[].regionId__ | __string__  <br/>ID of the cloud region hosting the cluster.  |
| __data[].plan__ | __string__  <br/>Subscription plan of the cluster.  |
| __data[].cuType__ | __string__  <br/>CU type of the cluster. <br/>This applies to dedicated clusters only. For free and serverless clusters, the value is empty.  |
| __data[].cuSize__ | __integer__  <br/>CU size of the cluster. For free and serverless clusters, the value is always `0`.<br/>The value is less than or equal to 256.  |
| __data[].status__ | __string__  <br/>Current status of the cluster.  |
| __data[].connectAddress__ | __string__  <br/>Public endpoint of the cluster.  |
| __data[].privateLinkAddress__ | __string__  <br/>Private link of the cluster.  |
| __data[].projectId__ | __string__  <br/>ID of the project to which the cluster belongs.  |
| __data[].createTime__ | __string__  <br/>Time at which the cluster has been created.  |

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

