---
title: "delete() | Node.js"
slug: /node/node/Vector-delete
sidebar_label: "delete()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ID またはブール式を使用してエンティティを削除します。 | Node.js"
type: docx
token: KOZHdyeQvo4htOxhO8BcbEudnNd
sidebar_position: 2
keywords: 
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - オーディオ検索
  - zilliz
  - zilliz cloud
  - クラウド
  - delete()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# delete()

この操作は、ID またはブール式を使用してエンティティを削除します。

```javascript
await milvusClient.delete(data)
```

## リクエスト構文\{#request-syntax}

このメソッドには、次の代替形式があります。

### DeleteByIdsReq を使用する場合\{#with-deletebyidsreq}

```javascript
await milvusClient.delete({
   db_name: string,
   collection_name: string,
   partition_name?: string,
   ids: string[] | number[],
   consistency_level: string,
   timeout?: number
 })
```

**パラメーター:**

- **db_name** (*string*) -

    対象の collection を保持しているデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **partition_name** (*string*) -

    collection 内の既存の partition の名前。

- **ids** (*string[]* | *number[]*) -

    **[REQUIRED]**

    特定のエンティティ ID、またはエンティティ ID のリスト。

    デフォルト値は **None** で、scalar フィルタリング条件が適用されることを示します。

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象 collection の整合性レベル。デフォルト値は **Bounded** (**1**) で、**Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**)、**Eventually** (**3**) を選択できます。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが返るか、エラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;MutationResult&gt;*

このメソッドは、**MutationResult** オブジェクトに解決される promise を返します。

```typescript
{
    succ_index: number[],
    err_index: number[],
    acknowledged: boolean,
    insert_cnt: string,
    delete_cnt: string,
    upsert_cnt: string,
    timestamp: string,
    IDs: { int_id?: { data: number[] }, str_id?: { data: string[] }, id_field: 'int_id' | 'str_id' },
    status:  ResStatus
}
```

**パラメーター:**

- **succ_index** (*number[]*) -
入力された ID のうち、行に一致して削除済みとしてマークされたものの 0 ベースの位置。

- **err_index** (*number[]*) -
どの行にも一致しなかった入力 ID の 0 ベースの位置。

- **acknowledged** (*boolean*) -
削除が Milvus によって確認されたかどうか。

- **insert_cnt** (*string*) -
`delete()` では常に **"0"**。

- **delete_cnt** (*string*) -
この操作によって論理削除された行数。

- **upsert_cnt** (*string*) -
`delete()` では常に **"0"**。

- **timestamp** (*string*) -
削除が可視になった時点のハイブリッドタイムスタンプ。

- **IDs** (*StringArrayId* | *NumberArrayId*) -
この削除の対象となった主キー。フィールドの完全なリファレンスについては、`insert()` ドキュメントを参照してください。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.delete({
   collection_name: 'my_collection',
   ids: [1,2,3,4]
 });
```

</TabItem>

<TabItem value='java'>

```java
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

// Delete by IDs
const resStatus1 = await milvusClient.delete({
    collection_name: 'my_collection',
    ids: [1, 2, 3, 4],
});

// Delete by filter
const resStatus2 = await milvusClient.delete({
    collection_name: 'my_collection',
    filter: 'id in [5, 6, 7, 8]',
});
```

</TabItem>
</Tabs>
