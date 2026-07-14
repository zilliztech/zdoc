---
title: "addCollectionField() | Node.js"
slug: /node/node/Collections-addCollectionField
sidebar_label: "addCollectionField()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存の collection を再作成することなく新しい scalar field を追加します。field は内部スキーマ同期により最小限の遅延でほぼ即座に利用可能になります。 | Node.js"
type: docx
token: BKqIdIm0cop2s0xYjtQcSZL5nth
sidebar_position: 19
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionField()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionField()

この操作は、既存の collection を再作成することなく新しい scalar field を追加します。field は内部スキーマ同期により最小限の遅延でほぼ即座に利用可能になります。

```javascript
await milvusClient.addCollectionField(data: AddCollectionFieldReq)
```

<Admonition type="info" icon="📘" title="注意">

collection で dynamic field が有効になっている状態で、既存の dynamic field キーと同じ名前の static field を追加すると、その static field が dynamic field キーをマスクします。元の dynamic 値には `$meta['field_name']` 構文で引き続きアクセスできます。

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.addCollectionField({
    collection_name: string,
    db_name?: string,
    field: FieldType,
    timeout?: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    対象 collection の名前。

- **db_name** (*string*) -

    対象 database の名前。

- **field** (*FieldType*) -

    追加する field の設定です。これは以下のフィールドを持つ **FieldType** オブジェクトです。

    - **name** (*string)* -

        field の名前。

    - **data_type** (*string)* -

        field のデータ型。利用可能なすべてのデータ型の一覧については、[DataType](./Collections-DataType) を参照してください。

    - **description** (*string)* -

        field の説明。

    - **is_clustering_key** (*boolean*) -

        この field が clustering key として機能するかどうかを示すブール値。

    - **is_partition_key** (*boolean)* -

        この field が partition key field として機能するかどうかを示すブール値。

    - **is_primary_key** (*boolean)* -

        この field が primary key として機能するかどうか。

        デフォルト値は **False** です。これを **True** に設定すると、その field は collection 全体で一意な primary key field になります。

    - **type_params** (*string* | *number)* -

        field のその他のパラメータ。

        - **auto_id** (*boolean)* -

            この collection へのデータ挿入時に primary field が自動的に増分するかどうか。

            デフォルト値は **False** です。これを **True** に設定すると、primary field は自動的に増分します。カスタマイズされたスキーマで collection をセットアップする必要がある場合は、このパラメータをスキップしてください。

        - **dim** (*string* | *number*) -

            vector embeddings を保持する collection field の次元数。 

            値は 1 より大きい整数である必要があり、通常は vector embeddings の生成に使用するモデルによって決まります。

        - **element_type** (string) -

            array 内の要素のデータ型。 

            このパラメータは、現在の field が array field の場合に適用されます。

        - **max_capacity** (*string* | *number)* -

            array 内の要素数。

            このパラメータは、現在の field が array field の場合に適用されます。

        - **max_length** (*string*) -

            この field 内の文字列の最大長。

            これは、この field の **data_type** が **VarChar** の場合に必須です。

        - **type_params** (*object*) -

            現在の field に対する追加パラメータ（キーと値のペア）。

    - **nullable** (*boolean*) -

        field が null 値を受け入れられるかどうかを指定するブールパラメータ。有効な値:

        - **true**: field は null 値を含むことができ、field がオプションであり、エントリに対して欠損データが許可されることを示します。

        - **false** (default): field は各 entity に対して有効な値を含む必要があります。欠損データは許可されず、field は必須になります。

        詳細については、[Nullable & Default](https://milvus.io/docs/nullable-and-default.md) を参照してください。

    - **default_value** (*object*)

        collection schema の作成時に、schema 内の特定の field にデフォルト値を設定します。これは、データ挿入時に明示的に値が指定されなくても、特定の field に初期値を持たせたい場合に特に便利です。

    - **enable_analyzer** (*boolean*) -

        指定した `VarChar` field に対してテキスト解析を有効にするかどうか。`true` に設定すると、Milvus に対してテキストアナライザーを使用し、field のテキスト内容をトークン化およびフィルタリングするよう指示します。

    - **enable_match** (*boolean*)

        指定した `VarChar` field に対してキーワードマッチングを有効にするかどうか。`true` に設定すると、Milvus はその field に対して inverted index を作成し、高速かつ効率的なキーワード検索を可能にします。`enable_match` は `enable_analyzer` と連携して構造化された用語ベースのテキスト検索を提供し、`enable_analyzer` がトークン化を処理し、`enable_match` がそれらのトークンに対する検索操作を処理します。

    - **analyzer_params** (*object*)

        テキスト処理用の analyzer を設定します。特に `VarChar` field 用です。このパラメータは、主に [keyword matching](https://milvus.io/docs/keyword-match.md) または [full text search](https://milvus.io/docs/full-text-search.md) に使用されるテキスト field の tokenizer および filter 設定を構成します。analyzer の種類に応じて、次のいずれかの方法で設定できます。

        - Built-in analyzer

            ```javascript
            const analyzer_params: { type: 'english' };
            ```

            - `type` (*string*) -

                Milvus に組み込まれた事前設定済みの analyzer タイプで、名前を指定するだけですぐに使用できます。可能な値: `standard`, `english`, `chinese`。詳細については、[Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md)、および [Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md) を参照してください。

        - Custom analyzer

            ```javascript
            const analyzer_params: {
                "tokenizer": "standard",
                "filter": ["lowercase"],
            };
            ```

            - `tokenizer` (*string*) -

                tokenizer の種類を定義します。可能な値: `standard` (default), `whitespace`, `jieba`。詳細については、[Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md)、および [Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md) を参照してください。

            - `filter` (*list*) -

                tokenizer によって生成されたトークンを絞り込むための filter を一覧表示します。組み込み filter とカスタム filter のオプションがあります。詳細については、[Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) などを参照してください。

    - **external_field** (*string*) -

        この field がマッピングされる外部ソースファイル内の field 名。このパラメータは external collections に適用されます。

- **timeout** (*number*) -  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**RETURNS** *Promise\<ResStatus>*

このメソッドは **ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient(MILVUS_ADDRESS);
const resStatus = await milvusClient.addCollectionField({
  collection_name: 'my_collection',
  field: [{
    name: 'new_field',
    data_type: 'Int64',
    is_primary_key: false,
    description: 'A new field'
  }]
});
```
