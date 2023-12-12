---
displayed_sidebar: referenceSidebar
sidebar_position: 2
slug: /describe-cluster
title: Describe Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Describe a cluster in detail.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/clusters/{clusterId}" />

---

## Example


Describes the details of a cluster.

```shell
curl --request GET \
    --url "https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/clusters/<Cluster-ID>" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json"
```

Success response:

```shell
{
    "code": 200,
    "data": {
        "clusterId": "in03-45a099b7822fb6a",
        "clusterName": "Cluster-01",
        "description": "",
        "regionId": "gcp-us-west1",
        "clusterType": "",
        "cuSize": 0,
        "status": "RUNNING",
        "connectAddress": "https://in03-45a099b7822fb6a.api.gcp-us-west1.cloud-uat3.zilliz.com",
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
| `data`    | **object**<br/>A data object. |
| `data.clusterId`   | **string**<br/>The ID of the cluster. |
| `data.clusterName`   | **string**<br/>The Name of the cluster. |
| `data.description`   | **string**<br/>An optional description of the cluster. |
| `data.regionId`   | **string**<br/>The ID of the cloud region where the cluster exists. |
| `data.clusterType`   | **string**<br/>The type of the CU associated with the cluster. |
| `data.cuSize`   | **integer**<br/>The size of the CU used by the cluster. |
| `data.status`   | **string**<br/>The current status of the cluster. Possible values are **CREATING**, **RUNNING**, **SUSPENDING**, and **RESUMING**. |
| `data.connectAddress`   | **string**<br/>The public endpoint of the cluster. You can use this to connect to your cluster from public networks. |
| `data.privateLinkAddress`   | **string**<br/>The private endpoint of the cluster. You can use this to connect to your cluster from your VPSs in the same cloud region. |
| `data.createTime`   | **string**<br/>The time when this cluster has been creaated. |
| `data.storageSize`   | **integer(sint64)**<br/>The storage size of the cluster. |
| `data.snapshotNumber`   | **integer**<br/>The number of snapshofts created from the cluster. |
| `data.createProgress`   | **integer**<br/>The creation progress of the cluster. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Cluster not exist or you don't have permission. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90117 | "Invalid domain name used |

