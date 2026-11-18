---
title: "dropAlias() | Node.js"
slug: /node/node/Collections-dropAlias
sidebar_label: "dropAlias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定したコレクションエイリアスを削除します。 | Node.js"
type: docx
token: FubcdxJ0LoyQiJxmUMjcZnbjnbc
sidebar_position: 9
keywords: 
  - nlp search
  - hallucinations llm
  - Multimodal search
  - ベクトル search algorithms
  - zilliz
  - zilliz cloud
  - cloud
  - dropAlias()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropAlias()

この操作は、指定したコレクションエイリアスを削除します。 

```javascript
await milvusClient.dropAlias(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.dropAlias({
   alias: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **alias** (*string*) -

    **[REQUIRED]**

    コレクションのエイリアスです。 

    この操作の前に、エイリアスが存在することを確認してください。そうしないと、例外が発生します。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、レスポンスが返されるかエラーが発生した時点で、この操作はタイムアウトします。

**戻り値:**

*Promise\<ResStatus\>*

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


**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropAlias({
   alias: 'my_collection_alias',
});
```
