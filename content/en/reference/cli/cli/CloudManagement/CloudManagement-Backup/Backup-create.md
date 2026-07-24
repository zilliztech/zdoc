---
title: "create | Cloud"
slug: /cli/cli/Backup-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a backup for a cluster. | Cloud"
type: docx
token: RriNdfGjjofQL4x8XlhcHug6nvd
sidebar_position: 1
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
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

This operation creates a backup for a cluster.

## Description\{#description}

In Zilliz Cloud, a backup is a copy of your data that enables you to restore the entire cluster or specific collections in the event of data loss or system failure.

Running this command without any options guides you through a set of interactive prompts.

Backup creation incurs additional charges, with pricing based on the cloud region where the backup is stored. All backup files are stored in the same cloud region as the source cluster. For example, a cluster in `AWS us-west-2` will have its backups stored in `AWS us-west-2`.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz backup create
--cluster-id <value>
[--database <value>]
[--collection <value>]
[--output <value>]
[--query <value>]
[--no-header]
[--body <value>]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the cluster ID, which is similar to `inxx-xxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--database** (*string*) -

    Indicates the database name for collection-level backup.

- **--collection** (*string*) -

    Indicates a collection name. You can omit it for a full cluster backup.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

- **--body** (*string*) -

    A raw JSON string that matches the following schema. For concrete examples, refer to [Create Backup](/reference/restful/create-backup-v2).

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "create backup",
        "type": "object",
        "properties": {
            "backupType": {
                "type": "string",
                "enum": [
                    "CLUSTER",
                    "COLLECTION"
                ]
            },
            "dbCollections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "dbName": {
                            "type": "string"
                        },
                        "collectionNames": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        }
                    }
                }
            },
            "crossRegionCopies": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "regionId": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "required": [
            "backupType"
        ]
    }
    ```

## Example\{#example}

```bash
# Full cluster backup (default)
zilliz backup create --cluster-id in01-xxxxxxxxxxxx

# Collection-level backup
zilliz backup create --cluster-id in01-xxxxxxxxxxxx \
--database default \
--collection my_col
```
