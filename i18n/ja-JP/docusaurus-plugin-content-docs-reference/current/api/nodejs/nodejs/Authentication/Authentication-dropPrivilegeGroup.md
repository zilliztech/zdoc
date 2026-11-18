---
title: "dropPrivilegeGroup() | Node.js"
slug: /node/node/Authentication-dropPrivilegeGroup
sidebar_label: "dropPrivilegeGroup()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーを特定のロールに追加します。 | Node.js"
type: docx
token: I63tdWAY2ok8V1xrK4tcrkwjncd
sidebar_position: 12
keywords: 
  - Dense ベクトル
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - dropPrivilegeGroup()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropPrivilegeGroup()

この操作は特権グループを削除します。

```javascript
await milvusClient.dropPrivilegeGroup(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropPrivilegeGroup({
   group_name: string,
   timeout?: number
})
```

**パラメーター:**

- **group_name** (*string*) -

    **[必須]**

    削除する特権グループの名前です。

- **timeout** (*number*) -  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

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

**パラメーター:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
await milvusClient.dropPrivilegeGroup({
    group_name: 'my_group',
});
```
