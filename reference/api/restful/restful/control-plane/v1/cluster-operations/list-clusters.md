---
displayed_sidebar: restfulSidebar
sidebar_position: 1
slug: /restful/list-clusters
title: List Clusters
---

import RestHeader from '@site/src/components/RestHeader';

Lists all clusters in the specified cloud region.

<RestHeader method="get" endpoint="https://${CLUSTER_ENDPOINT}/v1/clusters" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

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
    | __pageSize__  | **integer**<br/>The number of records to return on each page.|
    | __current__  | **integer**<br/>The current page number.|

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**<br/>|

### Request Body

No request body required

## Response

Returns a list of your clusters.

### Response Body

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

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.count__ | __integer__  <br/>The total number of clusters returned.  |
| __data.currentPage__ | __integer__  <br/>The current page in the results.  |
| __data.pageSize__ | __integer__  <br/>The number of clusters per page in the results.  |
| __data[].clusters__ | __array__<br/>An array of clusters in detail. |
| __data[].clusters[]__ | __object__<br/> |
| __data[].clusters[].clusterId__ | __string__  <br/>The ID of the cluster.  |
| __data[].clusters[].clusterName__ | __string__  <br/>The name of the cluster.  |
| __data[].clusters[].description__ | __string__  <br/>An optional description about the cluster.  |
| __data[].clusters[].regionId__ | __string__  <br/>The ID of the region where the cluster exists.  |
| __data[].clusters[].clusterType__ | __string__  <br/>The type of CU associated with the cluster. Possible values are **Performance-optimized** and **Capacity-optimized**.  |
| __data[].clusters[].cuSize__ | __integer__  <br/>The size of the CU associated with the cluster.  |
| __data[].clusters[].status__ | __string__  <br/>The current status of the cluster. Possible values are **INITIALIZING**, **RUNNING**, **SUSPENDING**, and **RESUMING**.  |
| __data[].clusters[].connectAddress__ | __string__  <br/>The public endpoint of the cluster. You can connect to the cluster using this endpoint from the public network.  |
| __data[].clusters[].privateLinkAddress__ | __string__  <br/>The private endpoint of the cluster. You can set up a private link to allow your VPS in the same cloud region to access your cluster.  |
| __data[].clusters[].createTime__ | __string__  <br/>The time at which the cluster has been created.  |

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

