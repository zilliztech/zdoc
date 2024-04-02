---
displayed_sidebar: restfulSidebar
sidebar_position: 4
slug: /restful/describe-cluster
title: Describe Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Describe a cluster in detail.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/clusters/{clusterId}" />

---

## Example


:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

:::

```shell
curl --request GET \
    --url "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/${clusterId}" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json"
```

Success response:

```shell
{
    "code": 200,
    "data": {
        "clusterId": "in03-***************",
        "clusterName": "Cluster-01",
        "description": "",
        "regionId": "gcp-us-west1",
        "clusterType": "",
        "cuSize": 0,
        "status": "RUNNING",
        "connectAddress": "https://in03-***************.api.gcp-us-west1.cloud-uat3.zilliz.com",
        "privateLinkAddress": "",
        "createTime": "2023-12-12T11:32:43Z",
        "storageSize": 0,
        "snapshotNumber": 0,
        "createProgress": 100
    }
}
```


## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `clusterId`  | **string**(required)<br/>The ID of a cluster to which this operation applies.|

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
        "projectId": "string",
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

| __code__ | integer  <br/>  |
| __data__ | object<br/> |
| __data.projectId__ | string  <br/>The ID of the project to which the current cluster belongs.  |
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
| __data.storageSize__ | integer (sint64) <br/>The storage size of the cluster in MB.  |
| __data.snapshotNumber__ | integer  <br/>The number of snapshofts created from the cluster.  |
| __data.createProgress__ | integer  <br/>The creation progress of the cluster.  |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Cluster not exist or you don't have permission. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90117 | Invalid domain name used |
