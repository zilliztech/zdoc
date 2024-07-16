---
displayed_sidebar: restfulSidebar
sidebar_position: 45
slug: /restful/drop-cluster
title: Drop Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Deletes a cluster. This operation moves your cluster to the recycle bin. All clusters in the recycle bin are pending permanent deletion in 30 days.

<RestHeader method="delete" endpoint="https://${CLUSTER_ENDPOINT}/v1/clusters/{CLUSTER_ID}/drop" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">

<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request DELETE "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/inxx-xxxxxxxxxxxxxxx/drop" \
--header "Authorization: Bearer ${API_KEY}"
```

Possible return is similar to the following:

```json
{
    "code": 200,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "The cluster has been deleted. If you consider this action to be an error, you have the option to restore the deleted cluster from the recycle bin within a 30-day period. Kindly note, this recovery feature does not apply to free clusters."
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

No request body required

## Response

Returns the ID of the deleted cluster.

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

