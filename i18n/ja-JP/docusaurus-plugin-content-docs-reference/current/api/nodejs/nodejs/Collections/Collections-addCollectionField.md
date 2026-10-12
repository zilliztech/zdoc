---
title: "addCollectionField() | Node.js"
slug: /node/node/Collections-addCollectionField
sidebar_label: "addCollectionField()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションを再作成することなく新しいスカラーフィールドを追加します。このフィールドは、内部でのスキーマ同期により最小限の遅延でほぼ即座に利用可能になります。 | Node.js"
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

この操作は、既存のコレクションを再作成することなく新しいスカラーフィールドを追加します。このフィールドは、内部でのスキーマ同期により最小限の遅延でほぼ即座に利用可能になります。

```javascript
await milvusClient.addCollectionField(data: AddCollectionFieldReq)
```

<Admonition type="info" title="Notes">

コレクションで動的フィールドが有効になっており、既存の動的フィールドキーと同じ名前の静的フィールドを追加すると、その静的フィールドが動的フィールドキーをマスクします。元の動的値には `$meta['field_name']` 構文で引き続きアクセスできます。

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

    対象コレクションの名前。

- **db_name** (*string*) -

    対象データベースの名前。

- **field** (*FieldType*) -

    追加するフィールドの構成。以下のフィールドを持つ **FieldType** オブジェクトです。

    - **name** (*string)* -

        フィールドの名前。

    - **data_type** (*string)* -

        フィールドのデータ型。利用可能なすべてのデータ型の一覧については、[DataType](./Collections-DataType) を参照してください。

    - **description** (*string)* -

        フィールドの説明。

    - **is_clustering_key** (*boolean*) -

        このフィールドがクラスタリングキーとして機能するかどうかを示すブール値。

    - **is_partition_key** (*boolean*) -

        このフィールドがパーティションキーフィールドとして機能するかどうかを示すブール値。

    - **is_primary_key** (*boolean*) -

        このフィールドがプライマリキーとして機能するかどうか。

        値のデフォルトは **False** です。これを **True** に設定すると、そのフィールドはコレクション全体で一意なプライマリキーフィールドになります。

    - **type_params** (*string* | *number)* -

        フィールドのその他のパラメーター。

        - **auto_id** (*boolean)* -

            このコレクションへのデータ挿入時にプライマリフィールドが自動的にインクリメントされるかどうか。

            値のデフォルトは **False** です。これを **True** に設定すると、プライマリフィールドが自動的にインクリメントされます。カスタマイズしたスキーマでコレクションをセットアップする必要がある場合は、このパラメーターをスキップしてください。

        - **dim** (*string* | *number*) -

            ベクトル埋め込みを保持するコレクションフィールドの次元数。 

            値は 1 より大きい整数である必要があり、通常はベクトル埋め込みの生成に使用するモデルによって決まります。

        - **element_type** (string) -

            array 内の要素のデータ型。 

            このパラメーターは、現在のフィールドが array フィールドの場合に適用されます。

        - **max_capacity** (*string* | *number)* -

            array 内の要素数。

            このパラメーターは、現在のフィールドが array フィールドの場合に適用されます。

        - **max_length** (*string*) -

            このフィールド内の文字列の最大長。

            これは、このフィールドの **data_type** が **VarChar** の場合に必須です。

        - **type_params** (*object*) -

            現在のフィールドの追加パラメーター（キーと値のペア）。

    - **nullable** (*boolean*) -

        フィールドが null 値を受け入れられるかどうかを指定するブール値のパラメーター。有効な値:

        - **true**: フィールドは null 値を含むことができ、そのフィールドが省略可能であり、エントリに対してデータの欠落が許可されることを示します。

        - **false**（デフォルト）: フィールドは各エンティティに対して有効な値を含む必要があり、データの欠落は許可されないため、フィールドは必須になります。

        詳細については、[Nullable & Default](https://milvus.io/docs/nullable-and-default.md) を参照してください。

    - **default_value** (*object*)

        コレクションスキーマの作成時に、スキーマ内の特定のフィールドにデフォルト値を設定します。これは、データ挿入時に値が明示的に指定されなくても、特定のフィールドに初期値を持たせたい場合に特に便利です。

    - **enable_analyzer** (*boolean*) -

        指定した `VarChar` フィールドに対してテキスト解析を有効にするかどうか。`true` に設定すると、Milvus に対してテキストアナライザーを使用するよう指示し、フィールドのテキストコンテンツをトークン化してフィルタリングします。

    - **enable_match** (*boolean*)

        指定した `VarChar` フィールドに対してキーワードマッチングを有効にするかどうか。`true` に設定すると、Milvus はそのフィールドに対する転置インデックスを作成し、高速で効率的なキーワード検索を可能にします。`enable_match` は `enable_analyzer` と連携して、構造化された用語ベースのテキスト検索を提供します。`enable_analyzer` がトークン化を処理し、`enable_match` がこれらのトークンに対する検索操作を処理します。

    - **analyzer_params** (*object*)

        テキスト処理用のアナライザーを設定します。特に `VarChar` フィールド用です。このパラメーターは、[keyword matching](https://milvus.io/docs/keyword-match.md) や [full text search](https://milvus.io/docs/full-text-search.md) で使用されるテキストフィールドのトークナイザーとフィルターの設定を行います。アナライザーの種類に応じて、次のいずれかの方法で設定できます。

        - Built-in analyzer

            ```javascript
            const analyzer_params: { type: 'english' };
            ```

            - `type` (*string*) -

                Milvus に組み込まれた事前構成済みのアナライザータイプで、名前を指定するだけでそのまま使用できます。指定可能な値: `standard`、`english`、`chinese`。詳細については、[Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md)、[Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md) を参照してください。

        - Custom analyzer

            ```javascript
            const analyzer_params: {
                "tokenizer": "standard",
                "filter": ["lowercase"],
            };
            ```

            - `tokenizer` (*string*) -

                トークナイザーの種類を定義します。指定可能な値: `standard`（デフォルト）、`whitespace`、`jieba`。詳細については、[Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md)、[Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md) を参照してください。

            - `filter` (*list*) -

                トークナイザーによって生成されたトークンを絞り込むフィルターを一覧表示します。組み込みフィルターとカスタムフィルターのオプションがあります。詳細については、[Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) などを参照してください。

    - **external_field** (*string*) -

        このフィールドがマッピングされる外部ソースファイル内のフィールドの名前。このパラメーターは外部コレクションに適用されます。

- **timeout** (*number*) -  

    この操作のタイムアウト期間。これを **None** に設定すると、何らかのレスポンスが到着したとき、または何らかのエラーが発生したときに、この操作がタイムアウトすることを示します。

**RETURNS** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

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

    報告されたエラーの理由を示す理由。この操作が成功した場合は空の文字列のままです。

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
