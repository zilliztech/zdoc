---
title: "replace() | Python | MilvusClient"
slug: /python/python/FieldOp-replace
sidebar_label: "replace()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "upsert 時にフィールドの明示的な置換操作を作成します。 | Python | MilvusClient"
type: docx
token: ES6KdwdwUoN700xriVUcS3EBnVc
sidebar_position: 5
keywords: 
  - 低コストなベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - 音声検索
  - zilliz
  - zilliz cloud
  - クラウド
  - replace()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# replace()

upsert 時に、フィールドの明示的な置換操作を作成します。

## リクエスト構文\{#request-syntax}

```python
FieldOp.replace() -> FieldPartialUpdateOp
```

**戻り値の型:**

*FieldPartialUpdateOp*

**戻り値:**

置換動作を選択する操作メッセージです。フィールド操作が指定されていない場合も、置換がデフォルトになります。

## 例\{#examples}

明示的な置換操作の値を作成します。

```python
from pymilvus import FieldOp

op = FieldOp.replace()
print(op)
```
