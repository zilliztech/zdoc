---
title: "restore-collection | Cloud"
slug: /cli/cli/Backup-restorecollection
sidebar_label: "restore-collection"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、バックアップから特定の collection を復元します。 | Cloud"
type: docx
token: XvDzdZsb3ojqgXxhEjfcZBxbnNb
sidebar_position: 8
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - restore-collection
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# restore-collection

この操作は、バックアップから特定の collection を復元します。

## Description\{#description}

Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合に、クラスター全体または特定の collection を復元できます。

クラスターを復元すると、新しいクラスターが作成され、バックアップされたすべての collection がそこにコピーされます。オプションなしでこのコマンドを実行すると、一連の対話型プロンプトが開始されます。

<Admonition type="info" icon="📘" title="注意">

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

    次のスキーマに一致する生の JSON 文字列です。具体的な例については、[Restore Collection Backup](/reference/restful/restore-collection-backup-v2) を参照してください。

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
