---
title: "append_row() | Python"
slug: /python/python/VolumeBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、1 行分のデータを内部バッファに追加します。バッファサイズが設定されたチャンクサイズを超えると、バッファは自動的にローカルファイルにフラッシュされ、リモートボリュームにアップロードされます。 | Python"
type: docx
token: Wlw2dkci9oDVsmx8hkDcf85qndf
sidebar_position: 1
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# append_row()

この操作は、1 行分のデータを内部バッファに追加します。バッファサイズが設定されたチャンクサイズを超えると、バッファは自動的にローカルファイルにフラッシュされ、リモートボリュームにアップロードされます。

## リクエスト構文\{#request-syntax}

```python
VolumeBulkWriter.append_row(
    row: Dict[str, Any],
    **kwargs
)
```

**パラメーター:**

- **row** (*Dict[str, Any]*) -

    **[必須]**

    1 行分のデータを表す辞書です。キーはコレクションのスキーマで定義されたフィールド名と一致している必要があり、値は対応するフィールド型に準拠している必要があります。

**例外:**

- **MilvusException**

    行データがコレクションのスキーマに対する検証に失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
writer.append_row(
    row={
        "id": 1,
        "vector": [0.1] * 128,
    },
)
```
