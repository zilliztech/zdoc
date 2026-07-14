---
title: "dropCollectionProperties() | Node.js"
slug: /node/node/Collections-dropCollectionProperties
sidebar_label: "dropCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションのプロパティをデフォルト値にリセットします。 | Node.js"
type: docx
token: EjFMdRFz0ofehXxxCPqc6raSnAg
sidebar_position: 11
keywords: 
  - nlp search
  - llm ハルシネーション
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - zilliz
  - zilliz cloud
  - クラウド
  - dropCollectionProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionProperties()

この操作は、特定のコレクションのプロパティをデフォルト値にリセットします。

```javascript
await milvusClient.dropCollectionProperties(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.dropCollectionProperties({
   db_name?: string
   collection_name: string,
   properties: string[],
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象のコレクションを保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    対象のコレクションの名前。

- **properties** (*string[]*) -

    **[REQUIRED]**

    TypeScript の **Record** 内で変更するプロパティとその期待値です。指定可能な値は次のとおりです。

    - **collection.ttl.seconds** -

        コレクションの有効期間（TTL）を秒単位で指定します。

    - **mmap.enabled** -

        コレクション内のすべてのフィールドの生データおよびインデックスに対して mmap を有効にするかどうか。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropCollectionProperties({
    collection_name: 'my-collection',
    delete_keys: ["collection.ttl.seconds"]
});
```

