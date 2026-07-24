---
title: "set | Cloud"
slug: /cli/cli/Context-set
sidebar_label: "set"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "This operation selects the default cluster endpoint and database that later data-plane commands use. Set a context before running collection, vector, index, partition, user, role, or alias commands. | Cloud"
type: docx
token: WF1JdhGAgodzpExXO1hcPjADn8b
sidebar_position: 3
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - set
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# set

This operation selects the default cluster endpoint and database that later data-plane commands use. Set a context before running collection, vector, index, partition, user, role, or alias commands.

## Description\{#description}

Sets the default cluster endpoint and database that later data-plane commands use. Set a context before running collection, vector, index, partition, user, role, or alias commands.

## Synopsis\{#synopsis}

```bash
zilliz context set
[--cluster-id <value>]
[--endpoint <value>]
[--database <value>]
[--on-demand]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    Specifies the cluster to use for subsequent data-plane commands. If you omit --endpoint, the CLI resolves the cluster endpoint from this cluster ID.

- **--endpoint** (*string*) -

    Specifies the cluster endpoint directly. Use this when you already know the endpoint or do not want the CLI to resolve it from a cluster ID.

- **--database** (*string*) -

    Specifies the default database for subsequent data-plane commands in the current context. This does not create a database.

- **--on-demand** (*boolean*) -

    Resolves cluster details for an on-demand cluster. Use this when the cluster ID belongs to an on-demand cluster.

## Example\{#example}

```bash
# Set context to a standard cluster
zilliz context set --cluster-id in01-xxxxxxxxxxxx

# Set context to an on-demand cluster
zilliz context set --cluster-id in-xxxxxxxxxxxx --on-demand

# Update the database for the current context
zilliz context set --database my_db
```
