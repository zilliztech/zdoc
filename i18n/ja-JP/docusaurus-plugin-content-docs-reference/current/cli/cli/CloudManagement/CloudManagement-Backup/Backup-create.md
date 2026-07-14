---
title: "create | Cloud"
slug: /cli/cli/Backup-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はクラスターのバックアップを作成します。 | Cloud"
type: docx
token: RriNdfGjjofQL4x8XlhcHug6nvd
sidebar_position: 1
keywords: 
  - 自然言語検索
  - 類似度検索
  - マルチモーダルRAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - 作成
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

この操作はクラスターのバックアップを作成します。

## Description\{#description}

Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合に、クラスター全体または特定のコレクションを復元できます。

オプションを指定せずにこのコマンドを実行すると、一連の対話型プロンプトに従って操作できます。

バックアップの作成には追加料金が発生し、料金はバックアップが保存されるクラウドリージョンに基づいて決まります。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2` 内のクラスターのバックアップは `AWS us-west-2` に保存されます。

<Admonition type="info" icon="📘" title="注記">

この機能は **Dedicated** クラスターでのみ使用できます。

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

    **[必須]**

    `inxx-xxxxx` のようなクラスター ID を指定します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを未設定のままにすると自動的に適用されます。

- **--database** (*string*) -

    コレクションレベルのバックアップ用のデータベース名を指定します。

- **--collection** (*string*) -

    コレクション名を指定します。クラスター全体のバックアップでは省略できます。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

- **--body** (*string*) -

    以下のスキーマに一致する生の JSON 文字列です。具体的な例については、[Create Backup](/reference/restful/create-backup-v2) を参照してください。

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
