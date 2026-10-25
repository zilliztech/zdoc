---
title: "GetRefreshExternalCollectionProgress() | Go | v2"
slug: /go/go/v2-Collection-GetRefreshExternalCollectionProgress
sidebar_label: "GetRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定された外部コレクションリフレッシュジョブの進行状況を返します。 | Go | v2"
type: docx
token: OTM3db7aroAXAYxrTy4cyVbwnGG
sidebar_position: 31
keywords: 
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - 音声検索
  - zilliz
  - zilliz cloud
  - クラウド
  - GetRefreshExternalCollectionProgress()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetRefreshExternalCollectionProgress()

この操作は、指定された外部コレクションリフレッシュジョブの進行状況を返します。

```go
func (c *Client) GetRefreshExternalCollectionProgress(ctx context.Context, option GetRefreshExternalCollectionProgressOption, callOptions ...grpc.CallOption) (*entity.RefreshExternalCollectionJobInfo, error)
```

## リクエスト構文\{#request-syntax}

GetRefreshExternalCollectionProgress() のリクエストを作成します。

```go
option := client.NewGetRefreshExternalCollectionProgressOption(jobID)

result, err := client.GetRefreshExternalCollectionProgress(option)
```

**パラメーター:**

- **jobID** (*int64*) -

    **[必須]**

**戻り値の型:**

&ast;*entity.RefreshExternalCollectionJobInfo*

**戻り値:**

指定された外部コレクションリフレッシュジョブの詳細を記録する構造体型です。

```go
type RefreshExternalCollectionJobInfo struct {
    JobID          int64
    CollectionName string
    State          RefreshExternalCollectionState
    Progress       int64
    Reason         string
    ExternalSource string
    StartTime      int64
    EndTime        int64
}
```

**パラメーター:**

- **JobID** (*int64*) -

    リフレッシュジョブの一意識別子です。

- **CollectionName** (*string*) -

    リフレッシュ対象のコレクションの名前です。

- **State** ([RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)) -

    リフレッシュジョブの現在の状態です。

- **Progress** (*int64*) -

    リフレッシュジョブの進捗率です。

- **Reason** (*string*) -

    現在の状態に関する追加情報または理由です。

- **ExternalSource** (*string*) -

    外部データソース識別子です。

- **ExternalSpec** (*string*) -

    外部データソースの仕様（JSON）です。ファイル形式とオブジェクトストレージの設定を記述します。

- **StartTime** (*int64*) -

    ジョブが開始された時刻の Unix タイムスタンプです。

- **EndTime** (*int64*) -

    ジョブが完了した時刻の Unix タイムスタンプです。

**エラー処理:**

- **error**

    検証、リクエストの構築、または RPC に失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

GetRefreshExternalCollectionProgress() の使用例を示します。

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
