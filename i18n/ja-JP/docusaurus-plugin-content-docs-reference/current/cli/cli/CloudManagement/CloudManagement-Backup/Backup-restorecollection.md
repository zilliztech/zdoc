---
title: "restore-コレクション | Cloud"
slug: /cli/cli/Backup-restorecollection
sidebar_label: "restore-コレクション"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation restores specific コレクション from a backup. | Cloud"
type: docx
token: XvDzdZsb3ojqgXxhEjfcZBxbnNb
sidebar_position: 8
keywords: 
  - ベクトル db comparison
  - openai ベクトル db
  - natural language processing データベース
  - cheap ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - restore-コレクション
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# restore-コレクション

This operation restores specific コレクション from a backup.

## Description\{#description}

In Zilliz Cloud, a backup is a copy of your data that enables you to restore the entire クラスター or specific コレクション in the event of data loss or system failure.

Restoring a クラスター creates a new クラスター and copies all backed-up コレクション to it. Running this command without options will trigger a set of interactive prompts.

<Admonition type="info" title="Notes">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## Synopisis\{#synopisis}

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

    `inxx-xxxxx` に似た、ソースクラスター ID を示します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを設定しなくても自動的に適用されます。

- **--backup-id** (*string*) -

    **[REQUIRED]**

    `backupx-xxxxx` に似た、バックアップ ID を示します。

- **--dest-cluster-id** (*string*) -

    **[REQUIRED]**

    `inxx-xxxxx` に似た、宛先クラスター ID を示します。

- **--output, -o** (*string*) -

    出力形式を示します。指定可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

- **--body** (*string*) -

    A raw JSON string that matches the following スキーマ. For concrete examples, refer to [Restore コレクション Backup](/reference/restful/restore-collection-backup-v2).

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

## Example\{#example}

```bash
zilliz backup restore-collection /
--cluster-id in01-xxxx /
--backup-id backup-xxxx /
--dest-cluster-id in01-yyyy
```
