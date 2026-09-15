---
title: "Go SDK リファレンス | Cloud"
displayed_sidebar: goSidebar
slug: /go
sidebar_label: "概要"
sidebar_position: 3
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# Go SDK リファレンス

Go SDK は、Zilliz Cloud 向けのネイティブな Go クライアントを提供します。現在の v2 モジュールは、Milvus 本体のリポジトリの `client/` ディレクトリでメンテナンスされており、接続管理、コレクション操作、データ書き込み、ベクトル検索、クラスター管理のための `milvusclient` パッケージを公開しています。

## 機能

- **Go らしいクライアント** — `context.Context` と型付きの `ClientConfig` を使用して `milvusclient.Client` を作成します。
- **オプションベースのリクエスト** — `NewListCollectionOption()` などのコンストラクターとチェーン可能なオプションメソッドを使用して操作を構成します。
- **コレクションとインデックスの管理** — スキーマを定義し、コレクションとインデックスを作成し、コレクションのロードを管理します。
- **データとベクトルの操作** — 型付きのベクトルと結果セットを使用して、挿入、アップサート、削除、クエリ、検索、ハイブリッド検索を実行します。
- **クラウド管理** — クラスターで利用可能なデータベース、パーティション、エイリアス、ユーザー、ロール、リソースグループを管理します。
- **Go エコシステムとの統合** — コンテキストとオプションの gRPC 呼び出しオプションを SDK の操作を通じて渡し、作業が完了したらクライアントを明示的にクローズします。

## インストール

`go get` を使用して、現在の v2 モジュールとその依存関係をインストールします。

```bash
go get -u github.com/milvus-io/milvus/client/v2
```

選択した SDK モジュールの `go.mod` ファイルで要求される Go のバージョンを使用してください。

## Zilliz Cloud への接続

クラスターの **Connect** カードからパブリックエンドポイントをコピーし、API キーまたはクラスターの資格情報をトークンとして使用します。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
	APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
	log.Fatal(err)
}
defer cli.Close(ctx)

collectionNames, err := cli.ListCollections(
	ctx,
	milvusclient.NewListCollectionOption(),
)
if err != nil {
	log.Fatal(err)
}

fmt.Println(collectionNames)
```

## リソース

- [Go SDK v2 Reference](./go/go/v2-Client-ClientConfig)
- [Go SDK v2 のソース](https://github.com/milvus-io/milvus/tree/master/client)
- [Go パッケージのドキュメント](https://pkg.go.dev/github.com/milvus-io/milvus/client/v2)

import DocCardList from '@theme/DocCardList';

<DocCardList />
