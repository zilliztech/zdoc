---
displayed_sidebar: restfulSidebar
sidebar_position: 28
slug: /restful/list-projects-v2
title: List Projects
---

import RestHeader from '@site/src/components/RestHeader';

List all projects scoped to API-Key.

<RestHeader method="get" endpoint="https://api.cloud.zilliz.com/v2/projects" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export API_KEY=""

curl --request GET \
    --url "https://api.cloud.zilliz.com/v2/projects" \
    --header "Authorization: Bearer ${API_KEY}"   \
    --header "accept: application/json"
```

Possible response is similar to the following

```json
{
    "code": 200,
    "data": [
        {
            "projectName": "Default Project",
            "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
            "instanceCount": 2,
            "createTime": "2023-08-16T07:34:06Z"
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
    | __Authorization__  | **string**(required)<br/>The authorization token. You should always use an API key with appropriate permissions.|
    | __Accept__  | **string**<br/>Use `application/json`.|

### Request Body

No request body required

## Response

Return a list of projects in detail.

### Response Body

```json
{
    "code": "number",
    "data": [
        {
            "projectId": "string",
            "projectName": "string",
            "instanceCount": "string",
            "createTime": "string"
        }
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/>Response payload. |
| __data[]__ | __object__<br/>List of projects in detail. |
| __data[].projectId__ | __string__  <br/>ID of a project.  |
| __data[].projectName__ | __string__  <br/>Name of a project.  |
| __data[].instanceCount__ | __string__  <br/>Number of clusters in the projects.  |
| __data[].createTime__ | __string__  <br/>Time at which the project is created.  |

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

