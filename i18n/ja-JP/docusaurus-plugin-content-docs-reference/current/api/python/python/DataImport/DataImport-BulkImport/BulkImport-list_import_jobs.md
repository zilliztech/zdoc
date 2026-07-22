---
title: "list_import_jobs() | Python"
slug: /python/python/BulkImport-list_import_jobs
sidebar_label: "list_import_jobs()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "projectid と regionid のフィルタリングを追加します。 | Python"
type: docx
token: N13hd7jVjoA6B1xlgwic2GKRn5f
sidebar_position: 3
keywords: 
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画重複排除
  - zilliz
  - zilliz cloud
  - cloud
  - list_import_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_import_jobs()

project_id と region_id のフィルタリングを追加します。

## リクエスト構文\{#request-syntax}

```python
list_import_jobs(
    url: str,
    collection_name: str = "",
    db_name: str = "",
    cluster_id: str = "",
    project_id: str = "",
    region_id: str = "",
    api_key: str = "",
    page_size: int = 10,
    current_page: int = 1,
    verify: Optional[Union[bool, str]] = True,
    cert: Optional[Union[str, tuple]] = None,
    **kwargs,
) -> requests.Response
```

**パラメータ:**

- **url** (*str*) -
**[必須]**

    `https://api.cloud.zilliz.com` である Zilliz Cloud API サーバーのエンドポイント。

- **collection_name** (*str*) -
Default: `""`
インポートジョブを一覧表示する対象 collection の名前。

- **db_name** (*str*) -
Default: `""`
インポートジョブを一覧表示する対象データベースの名前。

- **cluster_id** (*str*) -
Default: `""`
対象の Zilliz Cloud cluster の ID。

- **project_id** (*str*) -
Default: `""`
対象 project データベースを含む Zilliz Cloud project の ID。

- **region_id** (*str*) -
Default: `""`
対象 project データベースを含む Zilliz Cloud リージョンの ID。

- **api_key** (*str*) -
Default: `""`

    リクエストの認証に使用される Zilliz Cloud API key。

- **page_size** (*int*) -
Default: `10`
1 ページあたりに返されるインポートジョブの最大数。

- **current_page** (*int*) -
Default: `1`
返される 1 始まりのページ番号。

- **verify** (*Optional[Union[bool, str]]*) -
Default: `True`
TLS 検証設定。デフォルトのトラストストアで検証するには `True` を使用し、CA 証明書パスを指定することもできます。

- **cert** (*Optional[Union[str, tuple]]*) -
Default: `None`
クライアント証明書のパス、または相互 TLS 用の証明書と秘密鍵のペア。

- **kwargs** (*Any*) -
HTTP リクエストに転送される追加オプション。

**戻り値の型:**

*requests.Response*

**戻り値:**

一致するインポートジョブとページネーション情報を含む HTTP レスポンス。

**例外:**

- **MilvusException**
サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細はサーバーのエラーメッセージを確認してください。

## 例\{#examples}

この例では、Zilliz Cloud からインポートジョブを一覧表示します。

```python
from pymilvus.bulk_writer import list_import_jobs

response = list_import_jobs(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxxx",
    region_id="aws-us-west-2",
)
print(response.json())
```
