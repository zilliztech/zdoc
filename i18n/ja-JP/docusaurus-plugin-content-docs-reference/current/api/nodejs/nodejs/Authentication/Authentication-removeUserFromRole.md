---
title: "removeUserFromRole() | Node.js"
slug: /node/node/Authentication-removeUserFromRole
sidebar_label: "removeUserFromRole()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のロールからユーザーを削除します。 | Node.js"
type: docx
token: XmyMdqvDLosr6oxzvhWcw8H2ntg
sidebar_position: 23
keywords: 
  - 動画重複排除
  - 動画類似検索
  - ベクトル retrieval
  - 音声類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - removeUserFromRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# removeUserFromRole()

この操作は、特定のロールからユーザーを削除します。

```javascript
await milvusClient.removeUserFromRole(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.removeUserFromRole({
   username: string,
   roleName: string,
   timeout?: number
 })
```

**パラメーター:**

- **username** (*string*) -

    **[必須]**

    ユーザー名。

- **roleName** (*string*) -

    **[必須]**

    ロール名

- **timeout** (*number*) -  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

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

    報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```javascript
await milvusClient.removeUserFromRole({
   username: 'my',
   roleName: 'myrole'
 });
```
