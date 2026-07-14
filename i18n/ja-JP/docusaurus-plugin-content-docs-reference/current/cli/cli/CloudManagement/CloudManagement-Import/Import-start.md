---
title: "start | Cloud"
slug: /cli/cli/Import-start
sidebar_label: "start"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はデータインポートジョブを開始します。 | Cloud"
type: docx
token: KXgLdSiiZoMou6xEvnQcdVe3n25
sidebar_position: 2
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - zilliz
  - zilliz cloud
  - cloud
  - start
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# start

この操作はデータインポートジョブを開始します。

## 説明\{#description}

データをインポートするには、受け入れ可能な形式に変換されていることを確認してください。詳細については、[BulkWriter を使用する](/docs/use-bulkwriter)を参照してください。

## 構文\{#synopsis}

```bash
zilliz import start
--cluster-id <value>
--collection <value>
[--output <value>]
[--query <value>]
[--no-header]
--body <value>
```

## オプション\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    `inxx-xxxxx` のようなターゲット cluster ID を示します。

    `zilliz context set` を使用して cluster が設定されている場合、このオプションが未設定であれば自動的に適用されます。

- **--collection** (*string*) -

    **[REQUIRED]**

    ターゲット collection 名を示します。

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

    **[REQUIRED]**

    リクエストボディを示します。これは複数のファイルパスを含む文字列化された JSON オブジェクト、または単一のファイルやフォルダへのパスである必要があります。アプリケーションのストレージオプションおよび形式オプションについては、[Storage Options](/docs/data-import-storage-options) と [Format Options](/docs/data-import-format-options) を参照してください。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "data paths",
        "type": "array",
        "items": {
            "type": "array",
            "items": {
                "type": "string",
            }
        }
    }
    ```

## 例\{#example}

```bash
# S3 からインポート
zilliz import start --cluster-id in01-xxxx --collection my_col --body '{"files": [["s3://bucket/data.json"]]}'

# JSON ファイルを使用してインポート
zilliz import start --cluster-id in01-xxxx --collection my_col --body file://import-spec.json
```
