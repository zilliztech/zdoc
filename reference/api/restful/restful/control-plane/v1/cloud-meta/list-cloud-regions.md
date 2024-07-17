---
displayed_sidebar: restfulSidebar
sidebar_position: 10
slug: /restful/list-cloud-regions
title: List Cloud Regions
---

import RestHeader from '@site/src/components/RestHeader';

Lists all available cloud regions of a specific cloud provider.

<RestHeader method="get" endpoint="https://${CLUSTER_ENDPOINT}/v1/regions" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request GET "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/regions?cloudId=gcp" \
--header "Authorization: Bearer ${API_KEY}"
```

Possible response is similar to the following.

```json
{
    "code": 200,
    "data": [
        {
            "cloudId": "gcp",
            "domain": "*.api.gcp-us-west1.zillizcloud.com",
            "regionId": "gcp-us-west1"
        }
    ]
}
```



## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __cloudId__  | **string**<br/>The ID of a valid cloud provider.|

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**<br/>|

### Request Body

No request body required

## Response

Returns a list of all available regions that the specified cloud provider offers.

### Response Body

```json
{
    "code": "integer",
    "data": [
        {
            "cloudId": "string",
            "regionId": "string",
            "domain": "string"
        }
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/> |
| __data[]__ | __object__<br/> |
| __data[].cloudId__ | __string__  <br/>The ID of a cloud provider  |
| __data[].regionId__ | __string__  <br/>The ID of a cloud region  |
| __data[].domain__ | __string__  <br/>The base URL of an Zilliz Cloud open API endpiont  |

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

