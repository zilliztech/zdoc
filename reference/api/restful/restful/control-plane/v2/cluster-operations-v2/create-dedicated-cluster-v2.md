---
displayed_sidebar: restfulSidebar
sidebar_position: 51
slug: /restful/create-dedicated-cluster-v2
title: Create Dedicated Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Create dedicated cluster.

<RestHeader method="post" endpoint="https://api.cloud.zilliz.com/v2/clusters/createDedicated" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export API_KEY=""
export REGION_ID=""

curl --request POST \
     --url https://api.cloud.zilliz.com/v2/clusters/createDedicated \
     --header 'Authorization: Bearer ${API_KEY}' \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data-raw '{
        "clusterName": "Cluster-05",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "${REGION_ID}",
        "plan": "Standard",
        "cuType": "Performance-optimized",
        "cuSize": 1
      }'
```

Possible response is similar to the following
```json
{
  code: 0,
  data: {
     "clusterId": "inxx-xxxxxxxxxxxxxxx",
     "username":"db_admin",
     "password":"****************",
     "prompt": "Successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
  }
}
```



## Request

### Parameters

- No query parameters required

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**<br/>The authorization token. You should always use an API key with appropriate permissions.|
    | __Accept__  | **string**<br/>Use `application/json`.|
    | __Content-Type__  | **string**<br/>Use `application/json`.|

### Request Body

```json
{
    "clusterName": "string",
    "projectId": "string",
    "regionId": "string",
    "plan": "string",
    "cuType": "string",
    "cuSize": "integer"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __clusterName__ | __string__  <br/>Name of the cluster to create.  |
| __projectId__ | __string__  <br/>ID of the project to which the cluster belongs.  |
| __regionId__ | __string__  <br/>ID of the cloud region hosting the cluster.  |
| __plan__ | __string__  <br/>Subscription plan of the cluster. For details, refer to <a href="/docs/select-zilliz-cloud-service-plans">Select Zilliz Cloud Service Plans</a>.<br/>Possible values: "**Standard**", "**Enterprise**"  |
| __cuType__ | __string__  <br/>CU type of the cluster.<br/> This applies to dedicated clusters only. For free and serverless clusters, the value is empty.<br/>Possible values: "**Performance-optimized**", "**Capacity-optimized**"  |
| __cuSize__ | __integer__  <br/>CU size of the cluster. For free and serverless clusters, the value is always `0`.<br/>The value ranges from 1 to 256.  |

## Response

Returns the details of the created cluster.

### Response Body

```json
{
    "code": "integer",
    "data": {
        "clusterId": "string",
        "username": "string",
        "password": "string",
        "prompt": "string"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/>Response payload. |
| __data.clusterId__ | __string__  <br/>ID of the cluster created.  |
| __data.username__ | __string__  <br/>Name of the cluster administration user named `db_admin`.  |
| __data.password__ | __string__  <br/>Password of the cluster administration user.  |
| __data.prompt__ | __string__  <br/>Prompt messages returned.  |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

