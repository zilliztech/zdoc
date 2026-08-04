---
title: "describeAlias() | Node.js"
slug: /node/node/Collections-describeAlias
sidebar_label: "describeAlias()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は特定のエイリアスの情報を取得します。 | Node.js"
type: docx
token: YCzNdg5yWoeZVrxj7jGcb1UXnBd
sidebar_position: 7
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - describeAlias()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeAlias()

この操作は特定のエイリアスの情報を取得します。

```javascript
await milvusClient.describeAlias(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.describeAlias({
    db_name: string,
    alias: string,
    collection_name: string
})
```

**パラメータ:**

- **db_name** (*str*) -

    対象のコレクションを保持するデータベースの名前。

- **alias** (*str*) -

    **[REQUIRED]**

    コレクションのエイリアスです。エイリアスは事前に存在している必要があります。

    <Admonition type="info" icon="📘" title="注記">

    コレクションエイリアスとは何ですか？
    
        コレクションエイリアスは、コレクションに付ける追加の名前です。コレクションエイリアスは、コードを変更せずにアプリケーションを新しいコレクションに切り替えたい場合に便利です。 
    
        Zilliz Cloud では、コレクションエイリアスはグローバルに一意な識別子です。1 つのエイリアスは、厳密に 1 つのコレクションにのみ割り当てることができます。逆に、1 つのコレクションは複数のエイリアスを持つことができます。
    
        以下は、あるコレクションのエイリアスを別のコレクションに再割り当てする例です。
    
        `collection_1` と `collection_2` の 2 つのコレクションがあるとします。また、`bob` という名前のコレクションエイリアスがあり、もともとは `collection_1` に割り当てられていました。
    
        - `collection_1` のエイリアス = ["bob"]
    
        - `collection_2` のエイリアス = []
    
        `alter_alias("collection_2", "bob")` を呼び出した後:
    
        - `collection_1` のエイリアス = []
    
        - `collection_2` のエイリアス = ["bob"]

    </Admonition>

- **collection_name** (*str*) -

    **[REQUIRED]**

    指定されたエイリアスを持つコレクションの名前。

**戻り値** *Promise&lt;DescribeAliasResponse&gt;*

このメソッドは、**DescribeAliasResponse** オブジェクトに解決される promise を返します。

```typescript
{
    db_name: string,
    alias: string,
    collection: string,
    status:  ResStatus
}
```

**パラメータ:**

- **db_name** (*string*) -<br/>
  エイリアスを所有するデータベース。

- **alias** (*string*) -<br/>
  エイリアス名。

- **collection** (*string*) -<br/>
  エイリアスが現在指しているコレクション名。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.describeAlias({
   alias: 'my_collection_alias',
   collection_name: 'my_collection',
});
```
