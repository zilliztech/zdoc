---
title: "listPrivilegeGroups() | Node.js"
slug: /node/node/Authentication-listPrivilegeGroups
sidebar_label: "listPrivilegeGroups()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、すべての特権グループを一覧表示します。 | Node.js"
type: docx
token: HGpSdc7AOo7AV3xKCmOcWaIEnrd
sidebar_position: 19
keywords: 
  - 動画の重複排除
  - 動画の類似検索
  - ベクトル検索
  - 音声の類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - listPrivilegeGroups()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listPrivilegeGroups()

この操作では、すべての特権グループを一覧表示します。

```javascript
await milvusClient.listPrivilegeGroups(data?)
```

## リクエスト構文\{#request-syntax}

```javascript
 milvusClient.listPrivilegeGroups({
   timeout?: number
 })
```

**パラメーター:**

- **timeout** (*number*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、応答が到着するかエラーが発生したときに、この操作がタイムアウトすることを示します。

**戻り値:**

*Promise&lt;ListPrivilegeGroupsResponse&gt;*

このメソッドは、**ListPrivilegeGroupsResponse** オブジェクトに解決される Promise を返します。

```javascript
{
    privilege_groups: PrivelegeGroup[],
    status:  ResStatus
}
```

**パラメーター:**

- **privilege_groups** (*PrivelegeGroup[]*) -

現在の Milvus インスタンスで定義されている特権グループのリストです。

    - **group_name** (*string*) -

        特権グループの名前です。

    - **privileges** (*PrivilegeEntity[]*) -

        グループに含まれる特権です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合、**0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合、空の文字列のままです。


**例外:**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
await milvusClient.listPrivilegeGroups();
```

