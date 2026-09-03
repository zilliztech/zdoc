---
title: "Role | Python | ORM"
slug: /python/python/ORM-Role
sidebar_label: "Role"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "A Role instance represents a role with specific privileges to access your . | Python | ORM"
type: docx
token: LZL1d0kckouPXNxJLCmcwbCTnkG
sidebar_position: 11
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - Role
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Role

**Role** インスタンスは、特定の権限を持つロールを表します。

```python
class pymilvus.Role
```

## コンストラクタ\{#constructor}

名前とその他のパラメータからロールを構築します。

```python
Role(
    name: str,
    using: str
)
```

<Admonition type="info" icon="📘" title="注意">

コンストラクタを呼び出すだけではロールは作成されません。ロールを作成するには、ロールオブジェクトの `create()` メソッドを明示的に呼び出す必要があります。

</Admonition>

**パラメータ:**

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

    この操作中にエラーが発生すると、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import Role

# Create a role
role = Role(
    name="admin",
)
```

## メソッド\{#methods}

以下は `Role` クラスのメソッドです:
