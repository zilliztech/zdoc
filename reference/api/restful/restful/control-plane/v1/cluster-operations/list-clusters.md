---
displayed_sidebar: restfulSidebar
sidebar_position: 2
slug: /restful/list-clusters
title: List Clusters
---

import RestHeader from '@site/src/components/RestHeader';

Lists all clusters in the specified cloud region.

<RestHeader method="get" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters" />

---

## Example



```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request GET "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters?pageSize=10&current=1" \
--header "Authorization: Bearer ${API_KEY}"
```
Possible response is similar to the following.
```json
{
    "code": 200,
    "data": {
        "count": 1,
        "currentPage": 1,
        "pageSize": 10,
        "clusters": [
            {
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "clusterName": "Cluster-01",
                "description": "",
                "regionId": "gcp-us-west1",
                "clusterType": "Cost-optimized",
                "plan": "Free",
                "cuSize": 0,
                "status": "RUNNING",
                "connectAddress": "https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com",
                "privateLinkAddress": "",
                "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
                "createTime": "2024-04-01T06:42:31Z"
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
