---
displayed_sidbar: cliSidebar
title: "restore-collection | Cloud"
slug: /cli/cli/Backup-restorecollection
sidebar_label: "restore-collection"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation restores specific collections from a backup. | Cloud"
type: docx
token: AloudGinroMIAHxCT0GcJt5An4g
sidebar_position: 8
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - restore-collection
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# restore-collection

This operation restores specific collections from a backup.

## Description

In Zilliz Cloud, a backup is a copy of your data that enables you to restore the entire cluster or specific collections in the event of data loss or system failure.

Restoring a cluster creates a new cluster and copies all backed-up collections to it. Running this command without options will trigger a set of interactive prompts.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters.</p>

</Admonition>

## Synopisis

```bash
zilliz backup restore-collection
--cluster-id <value>
--backup-id <value>
--dest-cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
[--body <value>]
```

**OPTIONS:**

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the source cluster ID, which is similar to `inxx-xxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--backup-id** (*string*) -

    **[REQUIRED]**

    Indicates the backup ID, which is similar to `backupx-xxxxx`.

- **--dest-cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the destination cluster ID, which is similar to `inxx-xxxxx`.

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

    A raw JSON string that matches the following schema. For concrete examples, refer to [Restore Collection Backup](/reference/restful/restore-collection-backup-v2).

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Restore Collection",
        "type": "object",
        "properties": {
            "destClusterId": {
                "type": "string"
            },
            "dbCollections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "dbName": {
                            "type": "string"
                        },
                        "destDbName": {
                            "type": "string"
                        },
                        "collections": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "collectionName": {
                                        "type": "string"
                                    },
                                    "destCollectionName": {
                                        "type": "string"
                                    },
                                    "destCollectionStatus": {
                                        "type": "string",
                                        "enum": [
                                            "LOADED",
                                            "UNLOADED"
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "required": [
            "destClusterId"
        ]
    }
    ```

## Example

```bash
zilliz backup restore-collection /
--cluster-id in01-xxxx /
--backup-id backup-xxxx /
--dest-cluster-id in01-yyyy
```
