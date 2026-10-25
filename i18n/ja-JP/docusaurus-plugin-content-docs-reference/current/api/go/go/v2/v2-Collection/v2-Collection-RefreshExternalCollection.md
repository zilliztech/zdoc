---
title: "RefreshExternalCollection() | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollection
sidebar_label: "RefreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スキーマで定義された外部ストレージ内のデータファイルをスキャンし、それらのデータファイルへのマッピング関係を記録するメタデータファイルを生成します。 | Go | v2"
type: docx
token: Mw42dp2VZoN4gFxdiSYcxDB8n0g
sidebar_position: 33
keywords: 
  - ベクトル類似性検索
  - 近似最近傍探索
  - DiskANN
  - スパースベクトル
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - RefreshExternalCollection()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RefreshExternalCollection()

この操作は、スキーマで定義された外部ストレージ内のデータファイルをスキャンし、それらのデータファイルとのマッピング関係を記録するメタデータファイルを生成します。

```go
func (c *Client) RefreshExternalCollection(ctx context.Context, option RefreshExternalCollectionOption, callOptions ...grpc.CallOption) (*RefreshExternalCollectionResult, error)
```

## リクエスト構文\{#request-syntax}

RefreshExternalCollection() のリクエストを作成します。

```go
option := client.NewRefreshExternalCollectionOption(collectionName).
    WithExternalSource(externalSource string).
    WithExternalSpec(externalSpec string).
    WithDbName(dbName string)
    
result, err := client.RefreshExternalCollection(option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    既存の外部コレクションの名前です。

**ビルダーメソッド:**

- `WithExternalSource(externalSource string)`

    ソースデータ URI を設定します。この URI は AWS S3 オブジェクトパスに類似しています。

- `WithExternalSpec(externalSpec string)`

    外部ソースの仕様です。一連の二次パラメーターで構成されます。

    - **format** (*string*) -

        対象のソースデータファイルの形式です。使用可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **extfs** (*string*) -

        文字列化された JSON 構造の外部ファイルシステム設定です。使用可能なオプションは次のとおりです。

        - **access_key_id** (*string*) -

            オブジェクトストレージサービスのアクセスキー ID です。

        - **access_key_val** (*string*) -

            オブジェクトストレージサービスのアクセスキーの値です。

        - **cloud_provider** (*string*) -

            オブジェクトストレージサービスのクラウドプロバイダーです。

        - **region** (*string*) -

            オブジェクトストレージサービスのリージョンです。

        - **use_iam** (*string*) -

            バケットアクセスの認証に AWS IAM を使用するかどうかです。使用可能な値は `"true"` または `"false"` です。

        - **iam_endpoint** (*string*) -

            AWS IAM STS エンドポイントです。

        - **use_ssl** (*string*) -

            オブジェクトストレージバケットへのアクセスに SSL を使用するかどうかです。使用可能な値は `"true"` または `"false"` です。

        - **use_virtual_host** (*string*) -

            バケットアクセスに仮想ホスティングを使用するかどうかです。詳細は、[この記事](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html) を参照してください。

        - **storage_type** (*string*) -

            ストレージタイプです。使用可能な値は `remote` です。

        - **role_arn** (*string*) -

            バケット所有者から取得した AWS IAM ロール ARN です。

        - **external_id** (*string*) -

            バケット所有者から取得した外部 ID です。

        - **load_frequency** (*string*) -

            Milvus が一時認証情報を取得する間隔です（秒単位）。

- `WithDbName(dbName string)`

    対象の外部コレクションが属するデータベースの名前です。

**戻り値の型:**

&ast;*RefreshExternalCollectionResult*

**戻り値:**

次の形式の構造体型です。

```go
type RefreshExternalCollectionResult struct {
    JobID int64
}
```

**パラメーター:**

- **JobID** (*int64*) -

    作成された非同期ジョブを示す整数です。

**エラー処理:**

- **error**

    検証、リクエスト構築、または RPC のいずれかが失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

RefreshExternalCollection() の使用例を示します。

```go
refreshResult, err := client.RefreshExternalCollection(ctx,
    client.NewRefreshExternalCollectionOption("test_collection"))

jobID := refreshResult.JobID

for {
    progress, _ := client.GetRefreshExternalCollectionProgress(ctx,
        client.NewGetRefreshExternalCollectionProgressOption(jobID))

    fmt.Printf("State: %s\n", progress.State)

    if progress.State == entity.RefreshStateCompleted {
        fmt.Println("Refresh completed!")
        break
    }
    if progress.State == entity.RefreshStateFailed {
        fmt.Printf("Refresh failed: %s\n", progress.Reason)
        break
    }
    time.Sleep(2 * time.Second)
}
```
