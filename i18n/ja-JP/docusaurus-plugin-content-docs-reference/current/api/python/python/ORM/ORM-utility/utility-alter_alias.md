---
title: "alter_alias() | Python | ORM"
slug: /python/python/utility-alter_alias
sidebar_label: "alter_alias()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、あるコレクションのエイリアスを別のコレクションに再割り当てします。 | Python | ORM"
type: docx
token: MfTsdrbGcoO9JqxjgPtcMZTvncc
sidebar_position: 1
keywords: 
  - rag ベクターデータベース
  - ベクターデータベースとは
  - ベクターデータベースとは何か
  - ベクターデータベース比較
  - zilliz
  - zilliz cloud
  - クラウド
  - alter_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# alter_alias()

この操作は、あるコレクションのエイリアスを別のコレクションに再割り当てします。

## リクエスト構文\{#request-syntax}

```python
alter_alias(
    collection_name: str,
    alias: str,
    using: str,
    timeout: float | None
)
```

```python
from pymilvus import utility

# collection alias を変更
alter_alias(
    collection_name="string",
    alias="string",
    using="default"
)
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    エイリアスを再割り当てする対象コレクションの名前。

- **alias** (*str*) -

    **[必須]**

    コレクションのエイリアス。なお、このエイリアスは事前に存在している必要があります。

    <Admonition type="info" icon="📘" title="注">

    [コレクション](./ORM-Collection)エイリアスとは何ですか？
    
        [コレクション](./ORM-Collection)エイリアスは、コレクションの追加名です。コレクションエイリアスは、コードを変更することなくアプリケーションを新しいコレクションに切り替えたい場合に便利です。 
    
        [コレクション](./ORM-Collection)エイリアスは、グローバルに一意な識別子です。1 つのエイリアスは、1 つのコレクションにのみ割り当てることができます。逆に、1 つのコレクションは複数のエイリアスを持つことができます。
    
        以下は、あるコレクションのエイリアスを別のコレクションに再割り当てする例です。
    
        `collection_1` と `collection_2` という 2 つのコレクションがあるとします。また、`bob` という名前のコレクションエイリアスがあり、これはもともと `collection_1` に割り当てられていました。
    
        - `collection_1` のエイリアス = ["bob"]
    
        - `collection_2` のエイリアス = []
    
        `alter_alias("collection_2", "bob")` を呼び出した後:
    
        - `collection_1` のエイリアス = []
    
        - `collection_2` のエイリアス = ["bob"]

    </Admonition>

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、特に指定したエイリアスが存在しない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections, Collection, utility

# YOUR_CLUSTER_ENDPOINT への接続
connections.connect()

# 既存の 2 つの collections を取得
collection_1 = Collection("collection_1")
collection_2 = Collection("collection_2")

# collection_1 の alias を作成
utility.create_alias(collection_name="collection_1", alias="bob")

# 両方の collections の aliases を一覧表示
utility.list_aliases(collection_name="collection_1") # ['bob']
utility.list_aliases(collection_name="collection_2") # []
        
# alias を collection_2 に再割り当て
utility.alter_alias(collection_name="test_collection_2", alias="bob")

# 両方の collections の aliases を一覧表示
utility.list_aliases(collection_name="collection_1") # []
utility.list_aliases(collection_name="collection_2") # ['bob']
```

## 関連操作\{#related-operations}

以下の操作は `alter_alias()` に関連しています。

- [create_alias()](./utility-create_alias)

- [drop_alias()](./utility-drop_alias)

- [list_aliases()](./utility-list_aliases)

