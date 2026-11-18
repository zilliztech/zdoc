---
title: "runAnalyzer() | Node.js"
slug: /node/node/Collections-runAnalyzer
sidebar_label: "runAnalyzer()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、テスト目的で指定されたテキストに対して analyzer を実行します。 | Node.js"
type: docx
token: LsMldPd8GodoVqxCAZUcWYjdnwh
sidebar_position: 18
keywords: 
  - ベクトル検索
  - knn algorithm
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - クラウド
  - runAnalyzer()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# runAnalyzer()

この操作は、テスト目的で指定されたテキストに対して analyzer を実行します。

```javascript
await milvusClient.runAnalyzer(data)
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.runAnalyzer({
    analyzer_params: Record<string, any>,
    text: string | string[],
    with_detail: boolean,
    with_hash: boolean,
    db_name?: string,
    collection_name?: string,
    field_name?: string,
    analyzer_names?: string[],
})
```

**PARAMETERS:**

- **analyzer_params** (*Record&lt;string, any&gt;*) -

    analyzer のパラメータです。

- **text** (*string* | *string[]*) -

    分析対象の入力テキスト、またはテキストのリストです。

- **with_detail** (*boolean*) -

    詳細な分析出力を返すかどうかを示すオプションフラグです。

- **with_hash** (*boolean*) -

    ハッシュベースの処理を含めるかどうかを示すオプションフラグです。

- **db_name** (*string*) -

    analyzer が定義されているデータベースの名前です。

- **collection_name** (*string*) -

    analyzer を使用するコレクションの名前です。

- **field_name** (*string*) -

    analyzer を使用するフィールドの名前です。

- **analyzer_names** (*string[]*) -

    入力テキストに対して実行する analyzer の名前です。

**戻り値:**

*Promise&lt;RunAnalyzerResponse&gt;*

このメソッドは、**RunAnalyzerResponse** オブジェクトに解決される promise を返します。

```javascript
{
    results: AnalyzerResult[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **results** (*AnalyzerResult[]*) -
トークン化された出力です。**text** が単一の文字列の場合、このリストには 1 つのエントリが含まれます。**text** が配列の場合、エントリは入力順に並びます。

    - **tokens** (*AnalyzerToken[]*) -

        analyzer によって生成されたトークンです。

        - **token** (*string*) -

        トークンテキストです。

        - **start_offset** (*number*) -

        入力内でトークンが始まる位置の 0 始まりの文字オフセットです。

        - **end_offset** (*number*) -

        トークン直後の位置を示す 0 始まりの文字オフセットです。

        - **position** (*number*) -

        フレーズクエリで使用される、ストリーム内のトークン位置です。

        - **position_length** (*number*) -

        トークンがまたぐストリーム位置の数です。

        - **hash** (*number*) -

        トークンのハッシュです。リクエストで **with_hash** を **true** に設定した場合に格納されます。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.runAnalyzer({
    analyzer_params: {
        tokenizer: 'standard',
        filter: ['lowercase'],
    },
    text: 'Hello Milvus',
    with_detail: true,
});

console.log(res.results);
```
