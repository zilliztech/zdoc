---
title: "trigger | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-trigger
sidebar_label: "trigger"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
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

    Specifies the external source URI for this refresh.

    Provide it together with `--external-spec`, or omit both; when both are omitted, the refresh reuses the persisted source and spec.

    The option accepts two schemes: `volume://<volume_name>/<path>` and `milvus://<instance_id>/<db_name>/<collection_name>`. For a `volume://` URI, the rule above applies. Required for a `milvus://` source; if you omit it, the refresh does not take effect and the collection keeps serving the previously synced data.

- **--external-spec** (*string*) -

    Specifies the external source specifications for this refresh as a JSON string. Provide it together with `--external-source`, or omit both.

    For a `milvus://` source, you can omit it; `format` defaults to `milvus-table`.

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
# next-channel-start

# Trigger refresh for an external collection that uses a milvus:// source
zilliz external-collection refresh trigger --name my_external_coll --external-source milvus://in01-xxxx/default/orders
# next-channel-end
```
