---
displayed_sidebar: referenceSidebar
sidebar_position: 6
slug: /modify-cluster
title: Modify Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Modify the configuration of a specified cluster. Currently, you can use this API to change the size of the CU associated with your cluster.

<RestHeader method="post" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/clusters/{clusterId}/modify" />

---

## Example


:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

:::

```shell
curl --request POST \
    --url "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/${clusterId}/modify" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    --data-raw '{
    "cuSize": 2
    }'
```

Success response:

```shell
{
    "code": 200,
    "data": {
       "clusterId": "in01-***************",
       "prompt": "Submission successful, Cluster is currently upgrading and will take several minutes, you can use the DescribeCluster interface to obtain the creation progress and the status of the Cluster. When the Cluster status is RUNNING, you can access your vector database using the SDK."
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

```json
{
    "cuSize": "integer"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `cuSize`  | **integer**(required)<br/>The size of the CU to be associated to your cluster after the configuration.|

## Response

Returns the ID of the affected cluster.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "clusterId": "string",
        "prompt": "string"
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
| `data.clusterId`   | **string**<br/>The ID of a cluster. |
| `data.prompt`   | **string**<br/>The statement indicating that the current operation succeeds. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 80006 | Invalid cuSize. The parameter value should be one of [1 |
| 80014 | Invalid projectId. The projectId should like proj-xxxxxx |
| 80021 | Serverless cluster not support this operation. |

