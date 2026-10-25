---
title: "list | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-list
sidebar_label: "list"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists external-コレクション refresh jobs (optionally filtered by コレクション). | Cloud"
type: docx
token: YRQbd0bSOoMIDixpInlcg05jn4g
sidebar_position: 2
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists external-コレクション refresh jobs (optionally filtered by コレクション).

## Description\{#description}

Lists external-コレクション refresh jobs in the current クラスター context. Use `--name` and `--database` to narrow the result set.

## Synopsis\{#synopsis}

```bash
zilliz external-collection refresh list
[--name <value>]
[--database <value>]
```

## Options\{#options}

- **--name** (*string*) -

    Filter by external コレクション name.

- **--database** (*string*) -

    Specifies the データベース name.

## Example\{#example}

```bash
zilliz -o json external-collection refresh list --name my_external_coll

# Example output
# {
#   "jobs": []
# }
```
