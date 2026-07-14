---
title: "alterAlias() | Node.js"
slug: /node/node/Collections-alterAlias
sidebar_label: "alterAlias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ある collection の alias を別の collection に再割り当てします。 | Node.js"
type: docx
token: DXTLdtFCso7fo6xJHShc7XLpngh
sidebar_position: 1
keywords: 
  - ナレッジベース
  - 自然言語処理
  - AIチャットボット
  - コサイン距離
  - zilliz
  - zilliz cloud
  - クラウド
  - alterAlias()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterAlias()

この操作は、ある collection の alias を別の collection に再割り当てします。

```javascript
await milvusClient.alterAlias(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.alterAlias({
   alias: string,
   db_name: string
   collection_name: string,
   timeout?: number
 })
```

**パラメータ:**

- **alias** (*str*) -

    **[必須]**

    collection の alias です。alias はあらかじめ存在している必要があることに注意してください。

    <Admonition type="info" icon="📘" title="注">

    collection alias とは何ですか？
    
        collection alias は、collection に付ける追加の名前です。collection alias は、コードを変更せずにアプリケーションを新しい collection に切り替えたい場合に便利です。 
    
        Zilliz Cloud では、collection alias はグローバルに一意な識別子です。1 つの alias は、ちょうど 1 つの collection にのみ割り当てることができます。逆に、1 つの collection は複数の alias を持つことができます。
    
        以下は、ある collection の alias を別の collection に再割り当てする例です。
    
        `collection_1` と `collection_2` の 2 つの collection があるとします。また、`bob` という名前の collection alias があり、もともと `collection_1` に割り当てられていました。
    
        - `collection_1`'s alias = ["bob"]
    
        - `collection_2`'s alias = []
    
        `alter_alias("collection_2", "bob")` を呼び出した後:
    
        - `collection_1`'s alias = []
    
        - `collection_2`'s alias = ["bob"]

    </Admonition>

- **db_name** (*str*) -

    対象の collection を保持する database の名前です。

- **collection_name** (*str*) -

    **[必須]**

    alias を再割り当てする対象の collection 名です。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかの応答が到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

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
const resStatus = await milvusClient.alterAlias({
   alias: 'my_collection_alias',
   collection_name: 'my_collection',
});
```

