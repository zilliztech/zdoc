---
displayed_sidebar: restfulSidebar
sidebar_position: 73
slug: /restful/list-projects
title: List Projects
---

import RestHeader from '@site/src/components/RestHeader';

Lists all projects in the specified cloud region.

<RestHeader method="get" endpoint="https://${CLUSTER_ENDPOINT}/v1/projects" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request GET "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/projects" \
--header "Authorization: Bearer ${API_KEY}"
```
Possible response is similar to the following.
```json
{
    "code": 200,
    "data": [
        {
            "createTimeMilli": 1685006867000,
            "instanceCount": 1,
            "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
            "projectName": "Default Project"
        }
    ]
}
```



## Request

### Parameters

- No query parameters required

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**<br/>|

### Request Body

No request body required

## Response

Returns a list of projects.

### Response Body

```json
{
    "code": "integer",
    "data": [
        {
            "instanceCount": "integer",
            "projectId": "string",
            "projectName": "string"
        }
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/> |
| __data[]__ | __object__<br/> |
| __data[].instanceCount__ | __integer__  <br/>  |
| __data[].projectId__ | __string__  <br/>  |
| __data[].projectName__ | __string__  <br/>  |

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

