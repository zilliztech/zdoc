---
title: "Role | Python | ORM"
slug: /python/python/ORM-Role
sidebar_label: "Role"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Role インスタンスは、あなたの . にアクセスするための特定の権限を持つロールを表します。 | Python | ORM"
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

**Role** インスタンスは、あなたの . にアクセスするための特定の権限を持つロールを表します。

```python
class pymilvus.Role
```

## Constructor\{#constructor}

名前およびその他のパラメータを指定してロールを構築します。

```python
Role(
    name: str,
    using: str
)
```

<Admonition type="info" icon="📘" title="Notes">

コンストラクタを呼び出すだけではロールは作成されません。ロールを作成するには、role オブジェクトの `create()` メソッドを明示的に呼び出す必要があります。

</Admonition>

**PARAMETERS:**

- **name** (*string*) - 

    **[REQUIRED]**

    作成するロールの名前。

- **using** (*string*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作でデフォルト接続を使用することを示します。

**RETURN TYPE:**

*Role*

**RETURNS:**

ロールオブジェクト。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が送出されます。

## Examples\{#examples}

```python
from pymilvus import Role

# Create a role
role = Role(
    name="admin",
)
```

## Methods\{#methods}

以下は `Role` クラスのメソッドです:

