---
title: "describeAlias() | Node.js"
slug: /node/node/Collections-describeAlias
sidebar_label: "describeAlias()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は特定の alias を記述します。 | Node.js"
type: docx
token: YCzNdg5yWoeZVrxj7jGcb1UXnBd
sidebar_position: 7
keywords: 
  - k 近傍アルゴリズム
  - ANNS
  - ベクトル検索
  - knn アルゴリズム
  - zilliz
  - zilliz cloud
  - クラウド
  - describeAlias()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeAlias()

この操作は特定の alias を記述します。

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

    対象の collection を保持するデータベースの名前。

- **alias** (*str*) -

    **[REQUIRED]**

    collection の alias。alias は事前に存在している必要があります。

    <Admonition type="info" icon="📘" title="Note">

    collection alias とは何ですか？
    
        collection alias は、collection に付けられる追加の名前です。collection alias は、コードを変更せずにアプリケーションを新しい collection に切り替えたい場合に便利です。 
    
        Zilliz Cloud では、collection alias はグローバルに一意な識別子です。1 つの alias は、厳密に 1 つの collection にしか割り当てられません。逆に、1 つの collection は複数の alias を持つことができます。
    
        以下は、ある collection の alias を別の collection に再割り当てする例です。
    
        `collection_1` と `collection_2` という 2 つの collection があるとします。また、もともと `collection_1` に割り当てられていた `bob` という名前の collection alias もあります。
    
        - `collection_1` の alias = ["bob"]
    
        - `collection_2` の alias = []
    
        `alter_alias("collection_2", "bob")` を呼び出した後:
    
        - `collection_1` の alias = []
    
        - `collection_2` の alias = ["bob"]

    </Admonition>

- **collection_name** (*str*) -

    **[REQUIRED]**

    指定された alias を持つ collection の名前。

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

- **db_name** (*string*) -
alias を所有するデータベース。

- **alias** (*string*) -
alias 名。

- **collection** (*string*) -
alias が現在指している collection 名。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

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
