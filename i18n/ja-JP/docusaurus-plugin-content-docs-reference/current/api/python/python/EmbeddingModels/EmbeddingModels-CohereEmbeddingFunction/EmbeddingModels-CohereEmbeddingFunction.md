---
title: "CohereEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-CohereEmbeddingFunction
sidebar_label: "CohereEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CohereEmbeddingFunction は、Cohere 埋め込みモデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートする pymilvus のクラスです。 | Python"
type: docx
token: JzDLdkv3QoCY8OxKpBjc5zsmnId
sidebar_position: 1
keywords: 
  - Milvus とは
  - Milvus データベース
  - Milvus Lite
  - Milvus ベンチマーク
  - zilliz
  - zilliz cloud
  - cloud
  - CohereEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CohereEmbeddingFunction

CohereEmbeddingFunction は、Cohere 埋め込みモデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートする pymilvus のクラスです。

```python
pymilvus.model.dense.CohereEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けの CohereEmbeddingFunction を構築します。

```python
CohereEmbeddingFunction(
    model_name: str = "embed-english-light-v3.0",
    api_key: Optional[str] = None,
    input_type: str = "search_document",
    embedding_types: Optional[List[str]] = None,
    truncate: Optional[str] = None,
    **kwargs
)
```

**PARAMETERS:**

- **model_name** (*string*)

    エンコードに使用する Cohere 埋め込みモデルの名前です。利用可能な Cohere 埋め込みモデル名のいずれでも指定できます。たとえば、`embed-english-v3.0`、`embed-multilingual-v3.0` などです。このパラメータを指定しない場合は、`embed-english-light-v3.0` が使用されます。利用可能なモデルの一覧については、[Embed](https://docs.cohere.com/docs/models#embed) を参照してください。

- **api_key** (*string*)

    Cohere API にアクセスするための API key です。

- **input_type** (*string*)

    モデルに渡される入力の種類です。v3 以降の埋め込みモデルでは必須です。

    - `"search_document"`: 検索ユースケースのために vector database に保存される埋め込みに使用されます。

    - `"search_query"`: 関連ドキュメントを見つけるために vector DB に対して実行される検索クエリの埋め込みに使用されます。

    - `"classification"`: テキスト分類器に渡される埋め込みに使用されます。

    - `"clustering"`: クラスタリングアルゴリズムで処理される埋め込みに使用されます。

- **embedding_types** (*List[str]*)

    返される埋め込みの種類です。必須ではなく、デフォルトは None です。この場合、Embed Floats レスポンスタイプが返されます。現在、このパラメータには単一の値のみ指定できます。指定可能な値は次のとおりです。

    - `"float"`: デフォルトの float 埋め込みを取得したい場合に使用します。すべてのモデルで有効です。

    - `"binary"`: 符号付き binary 埋め込みを取得したい場合に使用します。v3 モデルでのみ有効です。

    - `"ubinary"`: 符号なし binary 埋め込みを取得したい場合に使用します。v3 モデルでのみ有効です。

- **truncate** (*string*)

    `NONE`|`START`|`END` のいずれかで、最大トークン長を超える入力を API がどのように処理するかを指定します。

    `START` を指定すると、入力の先頭が破棄されます。`END` を指定すると、入力の末尾が破棄されます。どちらの場合も、残りの入力がそのモデルの最大入力トークン長とちょうど同じになるまで入力が破棄されます。

    `NONE` を選択した場合、入力が最大入力トークン長を超えるとエラーが返されます。

    デフォルト: `END`

- **kwargs**

    モデルの初期化に追加のキーワード引数を渡せます。詳細については、[Embed](https://docs.cohere.com/reference/embed) を参照してください。

## Examples\{#examples}

```python
from pymilvus.model.dense import CohereEmbeddingFunction

cohere_ef = CohereEmbeddingFunction(
    model_name="embed-english-light-v3.0",
    api_key="YOUR_COHERE_API_KEY",
    input_type="search_document",
    embedding_types=["float"]
)
```
