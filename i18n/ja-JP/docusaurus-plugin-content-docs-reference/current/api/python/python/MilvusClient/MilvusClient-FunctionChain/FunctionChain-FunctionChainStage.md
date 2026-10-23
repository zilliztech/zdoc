---
title: "FunctionChainStage | Python | MilvusClient"
slug: /python/python/FunctionChain-FunctionChainStage
sidebar_label: "FunctionChainStage"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChainStage インスタンスは、関数チェーンを実行できる 1 つの実行ステージです。 | Python | MilvusClient"
type: docx
token: IUVldU03IosKJqxo8W9cU0g5nWh
sidebar_position: 2
keywords: 
  - LLM 評価
  - スパースとデンス
  - デンスベクトル
  - 階層型ナビゲート可能スモールワールド
  - zilliz
  - Zilliz Cloud
  - クラウド
  - FunctionChainStage
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChainStage

FunctionChainStage インスタンスは、関数チェーンを実行できる 1 つの実行ステージです。

**VALUES:**

- `UNSPECIFIED`

    ステージが指定されていません。

- `INGESTION`

    チェーンはデータの取り込み中に実行されます。

- `PRE_PROCESS`

    チェーンは、メインのクエリまたは検索プロセスの前に実行されます。

- `L0_RERANK`

    チェーンは、最初の再ランキングステージで実行されます。

- `L1_RERANK`

    チェーンは、2 番目の再ランキングステージで実行されます。

- `L2_RERANK`

    チェーンは、3 番目の再ランキングステージで実行されます。

- `POST_PROCESS`

    チェーンは、メインのクエリまたは検索プロセスの後に実行されます。

## 例\{#examples}

```python
from pymilvus import FunctionChain, FunctionChainStage

chain = FunctionChain(
    FunctionChainStage.L2_RERANK,
    name="rerank",
)
```
