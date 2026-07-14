---
title: "create | Cloud"
slug: /cli/cli/Index-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションフィールドにインデックスを作成します。 | Cloud"
type: docx
token: BUnSd1445oFLBxxHWfYc8UpmnXe
sidebar_position: 1
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
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

この操作はコレクションフィールドにインデックスを作成します。

## Description\{#description}

インデックス設定を調整する手間を省くために、Zilliz Cloud は AUTOINDEX と呼ばれる自動適応型のインデックスタイプによってインデックスのチューニングを処理します。[インデックス構築レベル](/docs/tune-index-build-level)と[リコール率](/docs/tune-recall-rate)を調整することで、検索パフォーマンスと精度を簡単に最適化できます。

スカラーフィールドについては、フィールドタイプに応じてインデックスタイプを設定できます。フィールドタイプと適用可能なインデックスタイプの対応については、[スカラーフィールドのインデックス作成](/docs/index-scalar-fields#overview)を参照してください。

## Synposis\{#synposis}

```bash
zilliz index create
--collection <value>
[--database <value>]
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--body <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    コレクション名を示します。

- **--database** (*string*) -

    データベース名を示します。

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

- **--body** (*json*) -

    生の JSON ボディ（または `file://path`）を示します。

    JSON は以下のスキーマに一致している必要があります。具体例については、[コレクションの作成](/reference/restful/create-collection-v2)を参照してください。

    ```json
    {
        "type": "object",
        "properties": {
            "indexParams": {
                "type": "array",
                "items": {
                    "type": "object",
                    "description": "Index parameters for a specific field.",
                    "properties": {
                        "metricType": {
                            "type": "string",
                            "description": "The similarity metric type used to build the index. For more information, refer to [Similarity Metrics Explained](/docs/search-metrics-explained).",
                            "enum": [
                                "L2",
                                "IP",
                                "COSINE"
                            ],
                            "default": "COSINE"
                        },
                        "fieldName": {
                            "type": "string",
                            "description": "The name of the target field on which an index is to be created. The value should be a string of no more than 255 characters, starting with an underscore (_) or a letter."
                        },
                        "indexName": {
                            "type": "string",
                            "description": "The name of the index to create. The value defaults to the target field name. The value should be a string of no more than 255 characters, starting with an underscore (_) or a letter."
                        },
                        "params": {
                            "description": "The index type and related settings. In Zilliz Cloud, the value should always be `AUTOINDEX`.",
                            "type": "object",
                            "properties": {
                                "index_type": {
                                    "type": "string",
                                    "description": "The type of the index to create"
                                }
                            },
                            "required": [
                                "index_type"
                            ]
                        }
                    },
                    "required": [
                        "metricType",
                        "fieldName",
                        "indexName"
                    ]
                },
                "description": "The parameters that apply to the index-building process."
            }
        },
        "required": [
            "indexParams",
            "collectionName"
        ]
    }
    ```

## Example\{#example}

```bash
zilliz index create --collection my_col --body '{"indexParams": [{"fieldName": "vector", "indexType": "AUTOINDEX"}]}'
```
