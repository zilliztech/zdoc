---
title: "ListRefreshExternalCollectionJobs() | Go | v2"
slug: /go/go/v2-Collection-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、すべてのコレクションまたは指定したコレクションを対象に、外部コレクションの更新ジョブを一覧表示します。 | Go | v2"
type: docx
token: KTeqdqUI2o3YO1xg3EXcJqGcnbe
sidebar_position: 32
keywords: 
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - OpenAI ベクトルデータベース
  - 自然言語処理データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - ListRefreshExternalCollectionJobs()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListRefreshExternalCollectionJobs()

この操作は、すべてのコレクションまたは指定したコレクションを対象に、外部コレクションの更新ジョブを一覧表示します。

```go
func (c *Client) ListRefreshExternalCollectionJobs(ctx context.Context, option ListRefreshExternalCollectionJobsOption, callOptions ...grpc.CallOption) ([]*entity.RefreshExternalCollectionJobInfo, error)
```

## リクエスト構文\{#request-syntax}

ListRefreshExternalCollectionJobs() のリクエストを作成します。

```go
option := client.NewListRefreshExternalCollectionJobsOption(collectionName)

result, err := client.ListRefreshExternalCollectionJobs(option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[必須]**

    対象のコレクションの名前です。このパラメーターを指定しない場合、すべての外部コレクションの更新ジョブが返されます。

**RETURN TYPE:**

*[]&ast;entity.RefreshExternalCollectionJobInfo*

**RETURNS:**

外部コレクションの更新ジョブの詳細をそれぞれ記録する *entity.RefreshExternalCollectionJobInfo* 構造体のリストです。

**PARAMETERS:**

- **JobID** (*int64*) -

    更新ジョブの一意の識別子です。

- **CollectionName** (*string*) -

    更新対象のコレクションの名前です。

- **State** ([RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)) -

    更新ジョブの現在の状態です。

- **Progress** (*int64*) -

    更新ジョブの進行状況（パーセント）です。

- **Reason** (*string*) -

    現在の状態に関する追加情報または理由です。

- **ExternalSource** (*string*) -

    外部データソースの識別子です。

- **ExternalSpec** (*string*) -

    ファイル形式とオブジェクトストレージ設定を記述する、外部データソースの仕様（JSON）です。

- **StartTime** (*int64*) -

    ジョブが開始された Unix タイムスタンプです。

- **EndTime** (*int64*) -

    ジョブが完了した Unix タイムスタンプです。

**ERROR HANDLING:**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

ListRefreshExternalCollectionJobs() の使用例を示します。

```go
// List refresh jobs of a specified collection
option := client.NewListRefreshExternalCollectionJobsOption("test_collection")

result, err = client.ListRefreshExternalCollectionJobs(option)
```
