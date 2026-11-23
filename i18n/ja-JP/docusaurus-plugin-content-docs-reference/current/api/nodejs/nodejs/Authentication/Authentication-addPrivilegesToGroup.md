---
title: "addPrivilegesToGroup() | Node.js"
slug: /node/node/Authentication-addPrivilegesToGroup
sidebar_label: "addPrivilegesToGroup()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、Milvus の特定の権限グループに権限を追加します。 | Node.js"
type: origin
token: shared-Authentication-addPrivilegesToGroup
keywords: 
  - 権限の追加
  - 権限グループ
  - RBAC
  - zilliz
  - zilliz cloud
  - クラウド
  - addPrivilegesToGroup()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# addPrivilegesToGroup()

この操作は、Milvus の特定の権限グループに権限を追加します。

```javascript
await milvusClient.addPrivilegesToGroup(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.addPrivilegesToGroup({
   group_name: string,
   privileges: string[],
   timeout?: number
 })
```

**パラメーター：**

- **group_name** (*string*) -

    **[必須]**

    権限グループの名前です。

- **privileges** (*string[]*) -

    **[必須]**

    上記のグループに追加する権限のリストです。

- **timeout** (*number*) -  

    この操作のタイムアウト期間です。 

    **None** に設定すると、応答の受信時またはエラー発生時にこの操作がタイムアウトすることを示します。

**戻り値：**

*Promise\<ResStatus\>*

このメソッドは、**ResStatus** オブジェクトに解決される Promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメーター：**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は、**0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は、**Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は、空の文字列のままです。


**例外：**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
await milvusClient.addPrivilegesToGroup({
    group_name: 'exampleGroup',
    privileges: ['CreateCollection', 'DropCollection'],
});
```

