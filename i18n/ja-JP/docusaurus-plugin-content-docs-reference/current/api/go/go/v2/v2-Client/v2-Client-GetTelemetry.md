---
title: "GetTelemetry() | Go | v2"
slug: /go/go/v2-Client-GetTelemetry
sidebar_label: "GetTelemetry()"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、クライアント側メトリクスを収集および報告するためのクライアントのテレメトリマネージャーを返します。 | Go | v2"
type: docx
token: DfoBdvU6SoC16Yx8zuEcwgw0nHh
sidebar_position: 5
keywords: 
  - HNSW アルゴリズム
  - ベクトル類似検索
  - 近似最近傍探索
  - DiskANN
  - zilliz
  - zilliz cloud
  - クラウド
  - GetTelemetry()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetTelemetry()

この操作は、クライアント側メトリクスを収集および報告するためのクライアントのテレメトリマネージャーを返します。

```go
func (c *Client) GetTelemetry() *ClientTelemetryManager
```

**戻り値の型：**

*ClientTelemetryManager*

**戻り値：**

このクライアントに関連付けられたテレメトリマネージャーを返します。テレメトリが有効になっていない場合は nil を返します。

**メソッド：**

- **GetClientID**（*string*） -

    このクライアントに割り当てられた一意のクライアント ID（UUID）を返します。この ID は、クライアントの有効期間中、gRPC の再接続を経ても変化しません。

- **GetConfigHash**（*string*） -

    現在有効なテレメトリ設定のハッシュを返します。

- **GetMetricsSnapshots**（<em>[]</em>MetricsSnapshot&ast;） -

    マネージャーが収集したすべての過去のメトリクススナップショットを返します。

- **GetLatestSnapshot**（&ast;*MetricsSnapshot*） -

    最新のメトリクススナップショットを返します。スナップショットが存在しない場合は nil を返します。

- **GetRecentErrors**（<em>[]</em>ErrorInfo&ast;） -

    デバッグ用に収集された最新のエラーを、要求された件数まで返します。

- **IsReady**（*bool*） -

    クライアントが初回のテレメトリ設定を完了したかどうかを報告します。

- **IsSupported**（*bool*） -

    最新のハートビート結果に基づき、接続中の Milvus サーバーがクライアント側テレメトリをサポートしているかどうかを報告します。

- **LastHeartbeatError**（*error*） -

    最新のハートビート失敗を返します。前回のハートビートが成功した場合は nil を返します。

**エラー処理：**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

GetTelemetry() の使用例を示します。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

telemetry := cli.GetTelemetry()
if telemetry != nil {
	fmt.Println("Telemetry client ID:", telemetry.GetClientID())
}
```
