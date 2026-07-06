---
title: "create | Cloud"
slug: /cli/cli/Project-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "This operation creates a new project. | Cloud"
type: docx
token: GXhEdTZt9or6nix81GtcENu9n0f
sidebar_position: 1
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

This operation creates a new project.

## Description\{#description}

Creates a new Zilliz Cloud project. Use `--region` one or more times when you want to bind regions during project creation.

## Synopsis\{#synopsis}

```bash
zilliz project create
--name <value>
--plan <value>
[--region <value>]
[--api-key <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    Specifies the project name.

- **--plan** (*string*) -

    **[REQUIRED]**

    Specifies the subscription plan. Choices: `Standard`, `Enterprise`, `BusinessCritical`.

- **--region** (*array*) -

    Specifies the region IDs to bind (repeatable, e.g. `--region aws-us-east-1 --region gcp-us-west1`).

- **--api-key** (string) -

    Specifies an API key for this command. This value overrides the environment or configured API key.

## Example\{#example}

```bash
# Create a project without regions
zilliz project create --name my-project --plan Standard

# Create a project with multiple regions
zilliz project create --name my-project --plan Standard --region aws-us-east-1 --region gcp-us-west1
```
