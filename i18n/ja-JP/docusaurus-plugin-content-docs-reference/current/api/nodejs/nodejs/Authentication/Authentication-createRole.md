---
title: "createRole() | Node.js"
slug: /node/node/Authentication-createRole
sidebar_label: "createRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はカスタムロールを作成します。 | Node.js"
type: docx
token: SDoYdccLWo1W3PxkNFncibwDnch
sidebar_position: 6
keywords: 
  - Milvus とは
  - milvus データベース
  - milvus lite
  - milvus ベンチマーク
  - zilliz
  - zilliz cloud
  - cloud
  - createRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# createRole()

この操作はカスタムロールを作成します。

```javascript
await milvusClient.createRole(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.createRole({
   roleName: string,
   description?: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[必須]**

    作成するロールの名前です。

- **description** (*string*) -

    作成するロールの説明です。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかの応答が到着した時点、または何らかのエラーが発生した時点で、この操作はタイムアウトすることを示します。

**RETURNS:**

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


**EXCEPTIONS:**

- **Error**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

## 例\{#example}

```javascript
await milvusClient.createRole({
   roleName: 'exampleRole',
 })
```
