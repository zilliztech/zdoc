---
title: "createAlias() | Node.js"
slug: /node/node/Collections-createAlias
sidebar_label: "createAlias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションに対してエイリアスを作成します。 | Node.js"
type: docx
token: MPuIdwujBoXM6rx7Okfc3lhZnUd
sidebar_position: 4
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - createAlias()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createAlias()

この操作は、既存のコレクションに対してエイリアスを作成します。

```javascript
await milvusClient.createAlias(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.createAlias({
   alias: string,
   db_name: string,
   collection_name: string,
   timeout?: number
 })
```

**パラメータ:**

- **alias** (*str*) -

    **[必須]**

    コレクションのエイリアスです。この操作の前に、エイリアスがまだ存在していないことを確認してください。すでに存在する場合、例外が発生します。

    <Admonition type="info" icon="📘" title="注">

    コレクションエイリアスとは何ですか？
    
        コレクションエイリアスは、コレクションの追加の名前です。コレクションエイリアスは、コードを変更せずにアプリケーションを新しいコレクションに切り替えたい場合に便利です。 
    
        Zilliz Cloud では、コレクションエイリアスはグローバルに一意な識別子です。1 つのエイリアスは、厳密に 1 つのコレクションにのみ割り当てることができます。逆に、1 つのコレクションは複数のエイリアスを持つことができます。
    
        以下は、あるコレクションのエイリアスを別のコレクションに再割り当てする例です。
    
        `collection_1` と `collection_2` という 2 つのコレクションがあるとします。また、`bob` という名前のコレクションエイリアスがあり、もともと `collection_1` に割り当てられていました。
    
        - `collection_1` のエイリアス = ["bob"]
    
        - `collection_2` のエイリアス = []
    
        `alter_alias("collection_2", "bob")` の呼び出し後:
    
        - `collection_1` のエイリアス = []
    
        - `collection_2` のエイリアス = ["bob"]

    </Admonition>

- **db_name** (*str*) -

    対象のコレクションを保持するデータベースの名前です。

- **collection_name** (*str*) -

    **[必須]**

    エイリアスを作成する対象のコレクション名です。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメータ:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.createAlias({
   alias: 'my_collection_alias',
   collection_name: 'my_collection',
 });
```

