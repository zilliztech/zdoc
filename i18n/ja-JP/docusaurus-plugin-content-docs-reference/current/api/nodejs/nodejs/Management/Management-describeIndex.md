---
title: "describeIndex() | Node.js"
slug: /node/node/Management-describeIndex
sidebar_label: "describeIndex()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は特定のインデックスの詳細を取得します。 | Node.js"
type: docx
token: PePIdiq9po6cplxAoF6ca5C2ntb
sidebar_position: 4
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - describeIndex()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeIndex()

この操作は特定のインデックスの詳細を取得します。

```javascript
await milvusClient.describeIndex(data)
```

## Request Syntax\{#request-syntax}

```javascript
 milvusClient.describeIndex({ 
     db_name: string,
     collection_name: string,
     field_name?: string,
     index_name?: string,
     timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象のコレクションを保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存のコレクションの名前。

- **field_name** (*string*) -

    コレクション内の既存フィールドの名前。 

- **index_name** (*string*) -

    詳細を取得するインデックスの名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが到着するかエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;DescribeIndexResponse&gt;*

このメソッドは、**DescribeIndexResponse** オブジェクトに解決される promise を返します。

```typescript
{
    index_descriptions: IndexDescription[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **index_descriptions** (*IndexDescription[]*) -<br/>
  要求されたコレクションのインデックス説明のリスト。**field_name** または **index_name** が指定されている場合、このリストには一致するエントリのみが含まれます。

    - **index_name** (*string*) -

        インデックス名。

    - **indexID** (*number*) -

        内部インデックス識別子。

    - **params** (*KeyValuePair[]*) -

        作成時に記録されたインデックスパラメータ（たとえば、**index_type**、**metric_type**、**params**）。

    - **field_name** (*string*) -

        インデックスが構築されるフィールド。

    - **indexed_rows** (*string*) -

        これまでにインデックス作成済みの行数。

    - **total_rows** (*string*) -

        インデックスがカバーする行の総数。

    - **state** (*string*) -

        インデックスの構築状態。使用可能な値は **IndexStateNone**、**Unissued**、**InProgress**、**Finished**、および **Failed** です。

    - **index_state_fail_reason** (*string*) -

        **state** が **Failed** の場合の失敗理由。それ以外の場合は空文字列です。

    - **pending_index_rows** (*string*) -

        まだインデックス作成を待機している行数。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const describeIndexReq = {
  collection_name: 'my_collection',
  index_name: 'my_index',
};
const res = await milvusClient.describeIndex(describeIndexReq);
console.log(res);
```

