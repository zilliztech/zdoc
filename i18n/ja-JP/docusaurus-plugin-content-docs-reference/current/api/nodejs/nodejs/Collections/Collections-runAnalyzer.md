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
  - cloud
  - runAnalyzer()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# runAnalyzer()

この操作は、テスト目的で指定されたテキストに対して analyzer を実行します。

```javascript
await milvusClient.runAnalyzer(data)
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient({
    analyzer_params: Record<string, any>,
    text: string | string[],
    with_detail: boolean,
    with_hash: boolean
})
```

**PARAMETERS:**

- **analyzer_params** (*Record&lt;string, any&gt;*) -

    analyzer のパラメータです。

- **text** (*string* | *string[]*) -

    分析対象の入力テキスト、またはテキストのリストです。

- **with_detail** (*boolean*) -

    詳細な分析結果を返すかどうかを示すオプションのフラグです。

- **with_hash** (*boolean*) -

    ハッシュベースの処理を含めるかどうかを示すオプションのフラグです。

**RETURNS** *Promise&lt;RunAnalyzerResponse&gt;*

このメソッドは、**RunAnalyzerResponse** オブジェクトに解決される promise を返します。

```typescript
{
    results: AnalyzerResult[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **results** (*AnalyzerResult[]*) -<br/>
  トークン化の出力です。**text** が単一の文字列である場合、このリストには 1 つのエントリがあります。**text** が配列である場合、エントリは入力順に対応します。

    - **tokens** (*AnalyzerToken[]*) -

        analyzer によって生成されたトークンです。

        - **token** (*string*) -

        トークンのテキストです。

        - **start_offset** (*number*) -

        入力内でトークンが始まる位置の 0 ベースの文字オフセットです。

        - **end_offset** (*number*) -

        トークンの直後の位置を示す 0 ベースの文字オフセットです。

        - **position** (*number*) -

        ストリーム内のトークン位置で、フレーズクエリで使用されます。

        - **position_length** (*number*) -

        トークンがまたがるストリーム位置の数です。

        - **hash** (*number*) -

        トークンのハッシュ値です。リクエストで **with_hash** を **true** に設定した場合に設定されます。

        - **token** (*string*) -

            トークンのテキストです。

        - **start_offset** (*number*) -

            入力内でトークンが始まる位置の 0 ベースの文字オフセットです。

        - **end_offset** (*number*) -

            トークンの直後の位置を示す 0 ベースの文字オフセットです。

        - **position** (*number*) -

            ストリーム内のトークン位置で、フレーズクエリで使用されます。

        - **position_length** (*number*) -

            トークンがまたがるストリーム位置の数です。

        - **hash** (*number*) -

            トークンのハッシュ値です。リクエストで **with_hash** を **true** に設定した場合に設定されます。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。
