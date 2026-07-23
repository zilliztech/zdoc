---
title: "run_analyzer() | Python | MilvusClient"
slug: /python/python/CollectionSchema-run_analyzer
sidebar_label: "run_analyzer()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は入力データを処理し、トークン化された出力を生成します。 | Python | MilvusClient"
type: docx
token: TWzjdJ61ho613AxKSd7clQt9nrg
sidebar_position: 6
keywords: 
  - ハイブリッドベクトル検索
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - run_analyzer()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# run_analyzer()

この操作は入力データを処理し、トークン化された出力を生成します。

## Request Syntax\{#request-syntax}

```python
run_analyzer(
    texts: Union[str, List[str]],
    analyzer_params: Union[str, Dict, None] = None,
    with_hash: bool = False,
    with_detail: bool = False,
    timeout: Optional[float] = None,
)
```

**PARAMETERS:**

- `texts` (*Union[str, List[str]]*) -

    分析対象の入力テキスト、またはテキストのリストです。

- `analyzer_params` (*Union[str, Dict, None]*) -

    analyzer のパラメータです。`None` に設定した場合、デフォルトで空の辞書になります。

- `with_hash` (*bool*) -

    ハッシュベースの処理を含めるかどうかを示すオプションのフラグです。

- `with_detail` (*bool*) -

    詳細な分析出力を返すかどうかを示すオプションのフラグです。

- `timeout` (*float* | *None*) -

    この操作のタイムアウト時間です。これを *None* に設定すると、レスポンスまたはエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*List[str], List[List[str]]*

**RETURNS:**

以下を含むタプル:

- 主なトークン化出力を表す文字列のリスト。

- 詳細なトークン情報を表す文字列リストのリスト（詳細出力が有効な場合）。

**EXCEPTIONS:**

- `MilvusException` - この操作中に何らかのエラーが発生した場合に発生します。

## Examples\{#examples}

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
