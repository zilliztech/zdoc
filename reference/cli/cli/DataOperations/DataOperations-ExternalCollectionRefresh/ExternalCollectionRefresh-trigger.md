---
title: "trigger | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-trigger
sidebar_key: cli/ExternalCollectionRefresh-trigger
sidebar_label: "trigger"
added_since: v1.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation triggers a refresh job for an external collection. Returns the job ID. | Cloud"
type: docx
token: ApSLdblNKo7ru0xGTqbconxBnSh
sidebar_position: 3
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - trigger
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# trigger

This operation triggers a refresh job for an external collection. Returns the job ID.

## Description\{#description}

Starts a refresh job for an external collection in the current cluster context. Use the returned `jobId` to check the job with `zilliz external-collection refresh describe`.

## Synopsis\{#synopsis}

```bash
zilliz external-collection refresh trigger
--name <value>
[--database <value>]
[--external-source <value>]
[--external-spec <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    Specifies the external collection name.

- **--database** (*string*) -

    Specifies the database name.

- **--external-source** (*string*) -

    Overrides the external source (optional).

- **--external-spec** (*string*) -

    Overrides the external spec (optional).

## Example\{#example}

```bash
# Trigger refresh for an external collection
zilliz external-collection refresh trigger --name my_external_coll

# Example output
# {
#   "jobId": 123456
# }

# Trigger refresh in a non-default database
zilliz external-collection refresh trigger --name my_external_coll --database my_db
```
