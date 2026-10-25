---
title: "run_analyzer() | Python | MilvusClient"
slug: /python/python/CollectionSchema-run_analyzer
sidebar_label: "run_analyzer()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は入力データを処理し、トークン化された出力を生成します。 | Python | MilvusClient"
type: docx
token: X7tsd4oAxoqVEvxXRkNc1Exqnif
sidebar_position: 6
keywords: 
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画の類似性検索
  - ベクトル取得
  - zilliz
  - zilliz cloud
  - クラウド
  - run_analyzer()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# run_analyzer()

この操作は入力データを処理し、トークン化された出力を生成します。

## リクエスト構文\{#request-syntax}

```python
run_analyzer(
```

**パラメーター:**

- **texts** (*Union[str, List[str]]*) -

    分析する入力テキストまたはテキストのリストです。

- **analyzer_params** (*Union[str, Dict, None]*) -

    アナライザーのパラメーターです。None に設定すると、空の辞書がデフォルトになります。

- **with_hash** (*bool*) -

    ハッシュベースの処理を含めるかどうかを示すオプションフラグです。

- **with_detail** (*bool*) -

    詳細な分析出力を返すかどうかを示すオプションフラグです。

- **collection_name** (*str | None*) -

    アナライザーを実行するコレクションの名前です。

- **field_name** (*str | None*) -

    入力テキストを分析するためにアナライザー設定が使用されるフィールドの名前です。

- **analyzer_names** (*str | list[str] | None*) -

    実行する組み込みアナライザーの名前または名前のリストです。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。*None* に設定すると、応答またはエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*List[str], List[List[str]]*

**戻り値:**

次を含むタプルです。- 主要なトークン化出力を表す文字列のリスト。- 詳細なトークン情報を表す文字列のリストのリスト（詳細出力が有効な場合）。

**例外:**

- **MilvusException**

    この操作中にエラーが発生するとスローされます。この操作中にエラーが発生するとスローされます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
)

analyzer_params = {
    "type": "standard", # Uses the standard built-in analyzer
    "stop_words": ["a", "an", "for"] # Defines a list of common words (stop words) to exclude from tokenization
}

# Sample text to analyze
text = "An efficient system relies on a robust analyzer to correctly process text for various applications."

# Run analyzer
result = client.run_analyzer(
    text,
    analyzer_params
)

print(result)

# Expected output:
# ['efficient', 'system', 'relies', 'on', 'robust', 'analyzer', 'to', 'correctly', 'process', 'text', 'various', 'applications']
```
