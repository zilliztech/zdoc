---
displayed_sidebar: restfulSidebar
sidebar_position: 55
slug: /restful/modify-cluster
title: Modify Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Modify the configuration of a specified cluster. Currently, you can use this API to change the size of the CU associated with your cluster.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v1/clusters/{CLUSTER_ID}/modify" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</li>
<li>This API requires applies only to dedicated clusters.</li>
</ul>
    
</Admonition>

```curl
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request POST 'https://controller.api.${CLOUD_REGION}.cloud-uat3.zilliz.com/v1/clusters/inxx-xxxxxxxxxxxxxxx/modify' \
--header "Authorization: Bearer ${API_KEY}" \
--data-raw '{
    "cuSize": 2
}'
```

Possible return is similar to the following.

```json
{
    "code": 200,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "Successfully submitted. Cluster is being upgraded, which is expected to take several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
    }
}
```



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

```json
{
    "cuSize": "integer"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __cuSize__ | __integer__  <br/>The size of the CU to be associated to your cluster after the configuration.  |

## Response

Returns the ID of the affected cluster.

### Response Body

```json
{
    "code": "integer",
    "data": {
        "clusterId": "string",
        "prompt": "string"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.clusterId__ | __string__  <br/>The ID of a cluster.  |
| __data.prompt__ | __string__  <br/>The statement indicating that the current operation succeeds.  |

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

