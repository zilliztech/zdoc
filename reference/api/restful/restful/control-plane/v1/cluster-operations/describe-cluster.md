---
displayed_sidebar: restfulSidebar
sidebar_position: 35
slug: /restful/describe-cluster
title: Describe Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Describe a cluster in detail.

<RestHeader method="get" endpoint="https://${CLUSTER_ENDPOINT}/v1/clusters/{CLUSTER_ID}" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request GET "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/inxx-xxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${API_KEY}"
```
Possible response is similar to the following.
```json
{
    "code": 200,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "clusterName": "Cluster-01",
        "description": "",
        "regionId": "gcp-us-west1",
        "clusterType": "",
        "plan": "Free",
        "cuSize": 0,
        "status": "DELETED",
        "connectAddress": "https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com",
        "privateLinkAddress": "",
        "createTime": "2024-04-01T06:32:39Z",
        "storageSize": 0,
        "snapshotNumber": 0,
        "createProgress": 100,
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx"
    }
}



## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __CLUSTER_ID__  | **string**(required)<br/>|

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**<br/>|

### Request Body

No request body required

## Response

Returns an array of clusters in detail.

### Response Body

```json
{
    "code": "integer",
    "data": {
        "clusterId": "string",
        "clusterName": "string",
        "description": "string",
        "regionId": "string",
        "clusterType": "string",
        "cuSize": "integer",
        "status": "string",
        "connectAddress": "string",
        "privateLinkAddress": "string",
        "createTime": "string",
        "storageSize": "integer",
        "snapshotNumber": "integer",
        "createProgress": "integer"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.clusterId__ | __string__  <br/>The ID of the cluster.  |
| __data.clusterName__ | __string__  <br/>The Name of the cluster.  |
| __data.description__ | __string__  <br/>An optional description of the cluster.  |
| __data.regionId__ | __string__  <br/>The ID of the cloud region where the cluster exists.  |
| __data.clusterType__ | __string__  <br/>The type of the CU associated with the cluster.  |
| __data.cuSize__ | __integer__  <br/>The size of the CU used by the cluster.  |
| __data.status__ | __string__  <br/>The current status of the cluster. Possible values are **CREATING**, **RUNNING**, **SUSPENDING**, and **RESUMING**.  |
| __data.connectAddress__ | __string__  <br/>The public endpoint of the cluster. You can use this to connect to your cluster from public networks.  |
| __data.privateLinkAddress__ | __string__  <br/>The private endpoint of the cluster. You can use this to connect to your cluster from your VPSs in the same cloud region.  |
| __data.createTime__ | __string__  <br/>The time when this cluster has been creaated.  |
| __data.storageSize__ | __integer__ (sint64) <br/>The storage size of the cluster.  |
| __data.snapshotNumber__ | __integer__  <br/>The number of snapshofts created from the cluster.  |
| __data.createProgress__ | __integer__  <br/>The creation progress of the cluster.  |

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

