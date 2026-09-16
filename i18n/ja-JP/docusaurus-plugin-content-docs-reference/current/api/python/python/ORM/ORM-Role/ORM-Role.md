---
title: "ロール | Python | ORM"
slug: /python/python/ORM-Role
sidebar_label: "ロール"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Role インスタンスは、ご利用の . にアクセスするための特定の権限を持つロールを表します。 | Python | ORM"
type: docx
token: LZL1d0kckouPXNxJLCmcwbCTnkG
sidebar_position: 11
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy ベクトル検索
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - ロール
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Role

**Role** インスタンスは、ご利用の . にアクセスするための特定の権限を持つロールを表します。

```python
class pymilvus.Role
```

## コンストラクター\{#constructor}

名前およびその他のパラメーターを指定してロールを構築します。

```python
Role(
    name: str,
    using: str
)
```

<Admonition type="info" title="Notes">

コンストラクターを呼び出しただけではロールは作成されません。ロールを作成するには、ロールオブジェクトの `create()` メソッドを明示的に呼び出す必要があります。

</Admonition>

**パラメーター:**

- **name** (*string*) - 

    **[必須]**

    作成するロールの名前。

- **using** (*string*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

**戻り値の型:**

*Role*

**戻り値:**

ロールオブジェクト。

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

## 例\{#examples}

```python
from pymilvus import Role

# Create a role
role = Role(
    name="admin",
)
```

## メソッド\{#methods}

以下は `Role` クラスのメソッドです。

