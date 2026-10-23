---
title: "commit() | Python"
slug: /python/python/VolumeBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、バッファされたデータをローカルファイルに永続化し、VolumeBulkWriter インスタンスで設定されたリモートボリュームにアップロードします。 | Python"
type: docx
token: FfGddUVeSolWXUxHWLoc8c6JnBd
sidebar_position: 2
keywords: 
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# commit()

この操作は、バッファされたデータをローカルファイルに永続化し、VolumeBulkWriter インスタンスで設定されたリモートボリュームにアップロードします。

## リクエスト構文\{#request-syntax}

```python
VolumeBulkWriter.commit(
    **kwargs
)
```

**パラメーター:**

- **_async** (*bool*) -

    非同期フラッシュのスイッチです。True の場合、フラッシュ操作はバックグラウンドスレッドで実行され、メソッドは直ちに戻ります。False（デフォルト）の場合、フラッシュが完了するまでメソッドはブロックされます。

- **call_back** (*Callable[[List[str]], List[str]]*) -

    ローカルファイルのフラッシュ後に呼び出される任意のコールバック関数です。VolumeBulkWriter では、このコールバックは内部的にファイルをリモートボリュームへアップロードするために使用されます。

**例外:**

- **MilvusException**

    フラッシュまたはアップロード操作が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
writer.commit()
```
