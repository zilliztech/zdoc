---
title: "hasCollection() | Node.js"
slug: /node/node/Collections-hasCollection
sidebar_label: "hasCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection が存在するかどうかを確認します。 | Node.js"
type: docx
token: FhbbdNrlNouBXJxHIdKctXVKnmf
sidebar_position: 13
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダル RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - hasCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# hasCollection()

この操作は、特定の collection が存在するかどうかを確認します。

```javascript
await milvusClient.hasCollection(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.hasCollection({ 
    db_name: string,
    collection_name: string,
    timeout?: number
})
```

**パラメータ:**

- **db_name** (*str*) -

    対象の collection を保持するデータベースの名前です。

- **collection_name** (*str*) -

    **[必須]**

    collection の名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、いずれかのレスポンスが返されるか、エラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;BoolResponse&gt;*

このメソッドは、**BoolResponse** オブジェクトに解決される promise を返します。

```typescript
{
    value: boolean,
    status:  ResStatus
}
```

**パラメータ:**

- **value** (*boolean*) -
要求された collection が存在するかどうかを示すブール値です。collection が存在する場合は **true**、存在しない場合は **false** です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合、**0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合、空文字列のままです。

## 例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.hasCollection({ collection_name: 'my_collection' });
```

