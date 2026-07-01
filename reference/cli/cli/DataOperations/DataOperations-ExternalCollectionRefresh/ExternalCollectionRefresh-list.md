---
title: "list | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-list
sidebar_key: cli/ExternalCollectionRefresh-list
sidebar_label: "list"
added_since: v1.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists external-collection refresh jobs (optionally filtered by collection). | Cloud"
type: docx
token: YRQbd0bSOoMIDixpInlcg05jn4g
sidebar_position: 2
keywords: 
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists external-collection refresh jobs (optionally filtered by collection).

## Description\{#description}

Lists external-collection refresh jobs in the current cluster context. Use `--name` and `--database` to narrow the result set.

## Synopsis\{#synopsis}

```bash
zilliz external-collection refresh list
[--name <value>]
[--database <value>]
```

## Options\{#options}

- **--name** (*string*) -

    Filter by external collection name.

- **--database** (*string*) -

    Specifies the database name.

## Example\{#example}

```bash
zilliz -o json external-collection refresh list --name my_external_coll

# Example output
# {
#   "jobs": []
# }
```
