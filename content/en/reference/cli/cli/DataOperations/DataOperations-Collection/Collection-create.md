---
title: "create | Cloud"
slug: /cli/cli/Collection-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "This operation creates a collection in the current Zilliz Cloud cluster context. | Cloud"
type: docx
token: Oq1Pd3N3popZ2ExT184cksHfnxh
sidebar_position: 2
keywords: 
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
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

This operation creates a collection in the current Zilliz Cloud cluster context.

## Description\{#description}

Creates a collection in the current Zilliz Cloud cluster context. Use CLI options for common schemas, or pass a JSON body for advanced collection definitions and external collections.

## Synopsis\{#synopsis}

```bash
zilliz collection create
[--name <value>]
[--dimension <value>]
[--metric-type <value>]
[--id-type <value>]
[--auto-id]
[--primary-field <value>]
[--vector-field <value>]
[--api-key <value>]
[--database <value>]
[--body <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    Specifies the collection name.

- **--dimension** (*integer*) -

    Specifies the vector dimension. Required unless `--body` is provided.

- **--metric-type** (*string*) -

    Specifies the distance metric. Default: `COSINE`. Choices: `COSINE`, `L2`, `IP`.

- **--id-type** (*string*) -

    Specifies the primary key type. Choices: `Int64`, `VarChar`.

- **--auto-id** (*boolean*) -

    Specifies whether Zilliz Cloud automatically generates primary key values.

- **--primary-field** (*string*) -

    Specifies the primary key field name.

- **--vector-field** (*string*) -

    Specifies the vector field name.

- **--api-key** (*string*) -

    Specifies an API key for this command. This value overrides the environment or configured API key.

- **--database** (*string*) -

    Specifies the database name.

- **--body** (*string*) -

    Passes a raw JSON request body. Use a JSON object string or `file://path`, for example `file://schema.json`. The body is merged with other flags.

## Example\{#example}

```bash
# Quick create with defaults
zilliz collection create --name my_collection --dimension 768

# Create with a body file
zilliz collection create --body file://schema.json
```
