---
title: "set | Cloud"
slug: /cli/cli/Context-set
sidebar_key: cli/Context-set
sidebar_label: "set"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation sets the current cluster context. | Cloud"
type: docx
token: F17Edjn73ooEBwxN1hWc7iCFngg
sidebar_position: 2
keywords: 
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
  - zilliz
  - zilliz cloud
  - cloud
  - set
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# set

This operation sets the current cluster context.

## Synopsis\{#synopsis}

```bash
zilliz context set
[--cluster-id <value>]
[--endpoint <value>]
[--database <value>]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    Indicates a cluster ID. Once set, the specified cluster always applies unless otherwise specified.

- **--endpoint** (*string*) -

    Indicates a cluster endpoint URL. This is optional, and will be auto-resolved from the specified cluster ID.

- **--database** (*string*) -

    Indicates a database name in the specified cluster.

## Example\{#example}

```bash
zilliz context set --cluster-id inxx-xxxxx
```
