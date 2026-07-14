---
title: "removePrivilegesFromGroup() | Node.js"
slug: /node/node/Authentication-removePrivilegesFromGroup
sidebar_label: "removePrivilegesFromGroup()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Milvus 内の特定の権限グループから権限を削除します。 | Node.js"
type: docx
token: EeAfdukBNoIIgCxX248c6VULnOb
sidebar_position: 22
keywords: 
  - ベクトル化
  - k nearest neighbor algorithm
  - ANNS
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - removePrivilegesFromGroup()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# removePrivilegesFromGroup()

この操作は、Milvus 内の特定の権限グループから権限を削除します。

```javascript
await milvusClient.removePrivilegesFromGroup(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.removePrivilegesFromGroup({
   group_name: string,
   privileges: string[],
   timeout?: number
 })
```

**パラメーター:**

- **group_name** (*string*) -

    **[REQUIRED]**

    権限グループの名前。

- **privileges** (*string[]*) -

    **[REQUIRED]**

    上記のグループから削除する権限のリスト。

- **timeout** (*number*) -  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

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

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
await milvusClient.removePrivilegesFromGroup({
    group_name: 'exampleGroup',
    privileges: ['CreateCollection', 'DropCollection'],
});
```

