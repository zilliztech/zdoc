---
displayed_sidebar: restfulSidebar
sidebar_position: {{sidebar_position}}
slug: /restful/{{page_slug}}
title: {{page_title}}
---

import RestHeader from '@site/src/components/RestHeader';

{{page_excerpt}}

<RestHeader method="{{page_method}}" endpoint="{{server}}{{page_url}}" />

---

## Example

{{ page_title | get_example }}

## Request

### Parameters

{% if query_params | length > 0 -%}

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    {%- for param in query_params %}
    | `{{param['name']}}`  | **{{param['schema']['type']}}** {%- if param['required'] -%}(required){%- endif -%}<br>{{param['description']}}{%- if param['default'] -%}<br>The value defaults to **{{param['default']}}**.{%- endif -%}{%- if param['minimum'] and param['maximum'] -%}<br>The value ranges from **{{param['minimum']}}** to **{{param['maximum']}}**.{%- endif -%}{%- if param['minimum'] and not param['maximum'] -%}<br>The minimum value is **{{param['minimum']}}**.{%- endif -%}{%- if param['maximum'] and not param['minimum'] -%}<br>The maximum value is **{{param['maximum']}}**.{%- endif -%} |
    {%- endfor %}

{%- else -%}

- No query parameters required

{%- endif %}

{% if path_params | length > 0 -%}

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    {%- for param in path_params %}
    | `{{param['name']}}`  | **{{param['schema']['type']}}** {%- if param['required'] -%}(required){%- endif -%}<br>{{param['description']}}{%- if param['default'] -%}<br>The value defaults to **{{param['default']}}**.{%- endif -%}{%- if param['minimum'] and param['maximum'] -%}<br>The value ranges from **{{param['minimum']}}** to **{{param['maximum']}}**.{%- endif -%}{%- if param['minimum'] and not param['maximum'] -%}<br>The minimum value is **{{param['minimum']}}**.{%- endif -%}{%- if param['maximum'] and not param['minimum'] -%}<br>The maximum value is **{{param['maximum']}}**.{%- endif -%} |
    {%- endfor %}

{%- else -%}

- No path parameters required

{%- endif %}

### Request Body

{%- if req_bodies | length > 0 -%}
{%- for req_body in req_bodies %}

```json
{{req_body | req_format }}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
{{ req_body | prepare_entries }}

{%- endfor %}
{%- else %}

No request body required

{%- endif %}

## Response

{{ res_desc }}

### Response Bodies

- Response body if we process your request successfully

```json
{{res_body | res_format }}
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
| `code`   | **integer**<br>Indicates whether the request succeeds.<br><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
{{ res_body | prepare_entries }}
| `message`  | **string**<br>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
{{ page_title | list_error }}