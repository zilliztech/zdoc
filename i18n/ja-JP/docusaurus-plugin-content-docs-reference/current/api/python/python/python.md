---
slug: /python
beta: FALSE
notebook: FALSE
sidebar_position: 1
displayed_sidebar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Python SDK リファレンス

[PyMilvus](https://github.com/milvus-io/pymilvus) Python SDK は、Milvus と Zilliz Cloud の公式 Python クライアントです。`MilvusClient` による高レベルの機能 API と、従来の ORM スタイル API の両方を提供します。

## 機能

- **MilvusClient** — 一般的な操作向けのシンプルな機能 API
- **ORM API** — 従来のオブジェクトリレーショナルマッピングスタイル API
- **Bulk import** — 大規模データ取り込み向けのローカルおよびリモート bulk writer
- **Embedding models** — `pymilvus[model]` によるテキストおよび画像 embedding の統合サポート
- **Rerankers** — ハイブリッド検索向けの組み込み reranking 関数

## インストールと更新

最新の PyMilvus をインストールする、または PyMilvus をこのバージョンに更新するには、ターミナルで次のコマンドを実行できます。

```shell
pip install --upgrade pymilvus==v2.3.7
```

インストール後、次を実行して pymilvus のバージョンを確認できます。

```python
from pymilvus import __version__

print(__version__)

# v2.3.7
```

## Cluster への接続

```python
from pymilvus import MilvusClient

# Authentication enabled with a cluster user
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password", # replace this with your token
)
```

## 新機能

このバージョンでは、PyMilvus に複数の機能メソッドを組み込んだ MilvusClient モジュールが追加されており、全体としてその機能は従来の ORM モジュールと整合しています。

import DocCardList from '@theme/DocCardList';

<DocCardList />

## 例

ドキュメントに加えて、[GitHub repository](https://github.com/milvus-io/pymilvus) の [example sets](https://github.com/milvus-io/pymilvus/tree/master/examples) も参照できます。
