---
title: "スキーマ | Go | v2"
slug: /go/go/v2-Collection-Schema
sidebar_label: "スキーマ"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "スキーマインスタンスは Milvus v3 のコレクションスキーマを定義し、struct 配列フィールドを検証して、外部コレクションソースの設定をサポートします。struct 配列のデコードでは null 許容状態が保持され、親に `maxcapacity` が含まれていない場合はサブフィールドから復元されます。`ExternalSource` と `ExternalSpec` は、外部コレクションのストレージと設定を表します。 | Go | v2"
type: docx
token: Du2ZdjCWIorDg4xdwercNnYgnJb
sidebar_position: 23
keywords: 
  - 高密度埋め込み
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - NLP 検索
  - zilliz
  - Zilliz Cloud
  - クラウド
  - スキーマ
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# スキーマ

スキーマインスタンスは Milvus v3 のコレクションスキーマを定義し、struct 配列フィールドを検証して、外部コレクションソースの設定をサポートします。struct 配列のデコードでは null 許容状態が保持され、親に `max_capacity` が含まれていない場合はサブフィールドから復元されます。`ExternalSource` と `ExternalSpec` は、外部コレクションのストレージと設定を表します。

```go
type Schema struct {
    CollectionName string
    Description string
    AutoID bool
    Fields []*Field
    EnableDynamicField bool
    Functions []*Function
    ExternalSource string
    ExternalSpec string
}
```

**フィールド：**

- **スキーマ** (*スキーマ*) -

    コレクションのスキーマ（フィールド定義、関数、動的フィールド設定を含む）を表します。 - **CollectionName** (*string*) - コレクション名を格納します。 - **Description** (*string*) - コレクションの説明を格納します。 - **AutoID** (*bool*) - Milvus が主キーを自動生成するかどうかを示します。 - **Fields** (<em>[]</em>Field*) - コレクションのフィールド定義を格納します。 - EnableDynamicField (*bool*) - 動的フィールドが有効かどうかを示します。 - Functions (*[]*Function*) - 組み込み関数の定義を格納します。 - **ExternalSource** (*string*) - 外部データソース（例: "s3://bucket/path"）。 - **ExternalSpec** (*string*) - 外部ソース設定（JSON）。

**ビルダーメソッド：**

- `WithName(name string) *Schema`

    コレクション名を設定します。

- `WithDescription(desc string) *Schema`

    コレクションの説明を設定します。

- `WithAutoID(autoID bool) *Schema`

    Milvus が主キーを自動生成するかどうかを設定します。

- `WithDynamicFieldEnabled(dynamicEnabled bool) *Schema`

    動的フィールドを有効または無効にします。

- `WithExternalSource(externalSource string) *Schema`

    AWS S3 オブジェクトパスに似たソースデータ URI を設定します。

- `WithExternalSpec(externalSpec string) *Schema`

    外部ソース設定を JSON として設定します。外部ソース仕様は、一連の補助パラメーターです。

    - **format** (*string*) -

        対象のソースデータファイルの形式です。指定できる値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **extfs** (*string*) -

        文字列化された JSON 構造の外部ファイルシステム設定です。使用できるオプションは次のとおりです。

        - **access_key_id** (*string*) -

            オブジェクトストレージサービスのアクセスキー ID です。

        - **access_key_val** (*string*) -

            オブジェクトストレージサービスのアクセスキーの値です。

        - **cloud_provider** (*string*) -

            オブジェクトストレージサービスのクラウドプロバイダーです。

        - **region** (*string*) -

            オブジェクトストレージサービスのリージョンです。

        - **use_iam** (*string*) -

            バケットへのアクセス認証に AWS IAM を使用するかどうか。指定できる値は `"true"` または `"false"` です。

        - **iam_endpoint** (*string*) -

            AWS IAM STS エンドポイントです。

        - **use_ssl** (*string*) -

            オブジェクトストレージバケットへのアクセスに SSL を使用するかどうか。指定できる値は `"true"` または `"false"` です。

        - **use_virtual_host** (*string*) -

            バケットへのアクセスに仮想ホスティングを使用するかどうか。詳細は、[この記事](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html) を参照してください。

        - **storage_type** (*string*) -

            ストレージタイプです。指定できる値は `remote` です。

        - **role_arn** (*string*) -

            バケット所有者から取得した AWS IAM ロール ARN です。

        - **external_id** (*string*) -

            バケット所有者から取得した外部 ID です。

        - **load_frequency** (*string*) -

            Milvus が一時認証情報を取得する間隔（秒）です。

- `WithField(field *Field) *Schema`

    フィールド定義をスキーマに追加します。

- `WithFunction(function *Function) *Schema`

    組み込み関数の定義をスキーマに追加します。

- `Validate() error`

    struct 配列のサブフィールドを検証し、サポートされていないネストまたはトップレベル専用フラグの場合にエラーを返します。

- `PKFieldName() string`

    主キーフィールドの名前を返します。

- `PKField() *Field`

    主キーフィールドの定義を返します。

## 例\{#example}

スキーマの使用法を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/entity"
)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("embedding").WithDataType(entity.FieldTypeFloatVector).WithDim(8))

schema := entity.NewSchema().
	WithField(entity.NewField().WithName("chunks").WithDataType(entity.FieldTypeArray).WithElementType(entity.FieldTypeStruct).WithStructSchema(structSchema))

err := schema.Validate()
fmt.Println(err)
```

- `WithExternalSource(externalSource string)`

    ソースデータ URI を設定します。この URI は、アクセス可能な外部ボリュームの名前である必要があります。

- `WithExternalSpec(externalSpec string)`

    外部ソース仕様は、一連の補助パラメーターです。

    - **format** (*string*) - 

        対象のソースデータファイルの形式です。

        指定できる値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

