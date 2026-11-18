---
title: "compact() | Node.js"
slug: /node/node/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、小さなセグメントを圧縮してより大きなセグメントにマージし、メモリ使用量を節約して検索パフォーマンスを向上させます。 | Node.js"
type: docx
token: DCK5d56UZop0kGxpQu8cLqlvndg
sidebar_position: 2
keywords: 
  - ハイブリッド検索
  - レキシカル検索
  - 最近傍探索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# compact()

この操作は、小さなセグメントを圧縮してより大きなセグメントにマージし、メモリ使用量を節約して検索パフォーマンスを向上させます。

```javascript
await milvusClient.compact(data)
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.compact({
    collection_name: string,
    db_name?: string,
    timetravel?: number | string,
    majorCompaction?: boolean,
    partition_id?: number | string,
    channel?: string,
    segment_ids?: number[],
    l0Compaction?: boolean,
    target_size?: number | string,
    timeout?: number,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    Compaction の対象となるコレクションの名前です。

- **db_name** (*string*) -

    対象のコレクションを保持するデータベースの名前です。

- **timetravel** (*number* | *string*) -

    過去のタイムスタンプです。Compaction は、このタイムスタンプより前にコミットされた削除済みデータを破棄します。

- **majorCompaction** (*boolean*) -

    コレクションの削除済みデータも Compaction の対象とするメジャー Compaction を実行するかどうかです。

- **partition_id** (*number* | *string*) -

    Compaction の対象となるパーティションの ID です。

- **channel** (*string*) -

    Compaction の対象となるセグメントのメッセージチャネルです。

- **segment_ids** (*number[]*) -

    Compaction の対象となるセグメント ID のリストです。

- **l0Compaction** (*boolean*) -

    L0 レベルの Compaction を実行するかどうかです。

- **target_size** (*number* | *string*) -

    Compaction 後のセグメントのターゲットサイズです。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するかエラーが発生した時点で、この操作はタイムアウトします。

**RETURNS:**

*Promise&lt;CompactionResponse&gt;*

このメソッドは、**CompactionResponse** オブジェクトに解決される promise を返します。

```javascript
{
    compactionID: string,
    compactionPlanCount: number,
    status:  ResStatus
}
```

**PARAMETERS:**

- **compactionID** (*string*) -
Compaction 操作の識別子です。進行状況をポーリングするには、この値を `getCompactionState()` または `getCompactionStateWithPlans()` に渡します。

- **compactionPlanCount** (*number*) -
この操作で生成された Compaction プランの数です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。


**EXCEPTIONS:**

- **Error**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.compact({
      collection_name: 'my_collection',
 });
```
