---
displayed_sidebar: restfulSidebar
sidebar_position: 4
slug: /restful/describe-cluster
title: Describe Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Describe a cluster in detail.

<RestHeader method="get" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/{CLUSTER_ID}" />

---

## Example



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
    | `CLUSTER_ID`  | **string**(required)<br/>|

### Request Body

No request body required

## Response

Returns an array of clusters in detail.

### Response Bodies

- Response body if we process your request successfully

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
| __data.clusterId__ | string  <br/>The ID of the cluster.  |
| __data.clusterName__ | string  <br/>The Name of the cluster.  |
| __data.description__ | string  <br/>An optional description of the cluster.  |
| __data.regionId__ | string  <br/>The ID of the cloud region where the cluster exists.  |
| __data.clusterType__ | string  <br/>The type of the CU associated with the cluster.  |
| __data.cuSize__ | integer  <br/>The size of the CU used by the cluster.  |
| __data.status__ | string  <br/>The current status of the cluster. Possible values are **CREATING**, **RUNNING**, **SUSPENDING**, and **RESUMING**.  |
| __data.connectAddress__ | string  <br/>The public endpoint of the cluster. You can use this to connect to your cluster from public networks.  |
| __data.privateLinkAddress__ | string  <br/>The private endpoint of the cluster. You can use this to connect to your cluster from your VPSs in the same cloud region.  |
| __data.createTime__ | string  <br/>The time when this cluster has been creaated.  |
| __data.storageSize__ | integer (sint64) <br/>The storage size of the cluster.  |
| __data.snapshotNumber__ | integer  <br/>The number of snapshofts created from the cluster.  |
| __data.createProgress__ | integer  <br/>The creation progress of the cluster.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |
