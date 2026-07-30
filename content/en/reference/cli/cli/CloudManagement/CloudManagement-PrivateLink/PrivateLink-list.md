---
title: "list | Cloud"
slug: /cli/cli/PrivateLink-list
sidebar_label: "list"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists PrivateLink endpoints for a project. | Cloud"
type: docx
token: JQ1JdRsfBo1LdpxdTSpcgrx4n3b
sidebar_position: 4
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

This operation lists PrivateLink endpoints for a project.

## Description\{#description}

Lists PrivateLink endpoints for a project, including pagination fields and endpoint entries in JSON output.

## Synopsis\{#synopsis}

```bash
zilliz privatelink list
--project-id <value>
[--api-key <value>]
```

## Options\{#options}

- **--project-id** (*string*) -

    Specifies the project ID whose PrivateLink endpoints you want to list.

    Project ID.

- **--api-key** (*string*) -

    Specifies an API key for this command. This value overrides the environment or configured API key.

## Example\{#example}

```bash
zilliz -o json privatelink list --project-id proj-xxxx

# Example output
# {
#   "count": 0,
#   "currentPage": 1,
#   "endpoints": [],
#   "pageSize": 10
# }
```
