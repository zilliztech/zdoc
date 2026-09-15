---
title: "Java SDK リファレンス | Cloud"
slug: /java
sidebar_label: "概要"
sidebar_position: 2
displayed_sidebar: javaSidebar
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# Java SDK リファレンス

[Milvus Java SDK](https://github.com/milvus-io/milvus-sdk-java) は、Zilliz Cloud 向けの Java SDK です。v2 クライアントである `MilvusClientV2` は、コレクション管理、データ操作、ベクトル検索、クラスター管理のために、型付きのリクエストビルダーとレスポンスオブジェクトを使用します。

## 機能

- **型付き v2 API** — Java ビルダーでリクエストを構築し、操作ごとのレスポンス型を使用します。
- **コレクションとインデックスの管理** — スキーマを定義し、コレクションとインデックスを作成し、コレクションのロードを制御します。
- **データとベクトルの操作** — Java アプリケーションから挿入、アップサート、削除、クエリ、検索、およびハイブリッド検索を実行します。
- **クラウド管理** — クラスターで利用可能なデータベース、パーティション、ユーザー、ロール、リソースグループを管理します。
- **クライアントプーリング** — アプリケーションで複数のクライアント接続を管理する必要がある場合は、SDK のプールクラスを使用します。
- **オプションの BulkWriter アーティファクト** — 一括インポート用のファイルを準備する場合は、`milvus-sdk-java-bulkwriter` を別途追加します。

## インストール

SDK には Java 8 以降が必要です。Maven でコアアーティファクトを追加します。

```xml
<dependency>
    <groupId>io.milvus</groupId>
    <artifactId>milvus-sdk-java</artifactId>
    <version>3.0.8</version>
</dependency>
```

または Gradle を使用します。

```groovy
implementation 'io.milvus:milvus-sdk-java:3.0.8'
```

アプリケーションで BulkWriter が必要な場合は、`io.milvus:milvus-sdk-java-bulkwriter` にも同じリリース番号を使用します。本番環境でバージョンを固定する前に、Maven Central または SDK リポジトリを確認してください。

## Zilliz Cloud への接続

クラスターの **Connect** カードからパブリックエンドポイントをコピーし、API キーまたはクラスターの資格情報をトークンとして使用します。

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.response.ListCollectionsResp;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String CLUSTER_TOKEN = "YOUR_CLUSTER_TOKEN";

ConnectConfig config = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(CLUSTER_TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(config);

try {
    ListCollectionsResp response = client.listCollections();
    System.out.println(response.getCollectionNames());
} finally {
    client.close();
}
```

## リソース

- [Java SDK v2 Reference](./java/java/v2-Client-ConnectConfig)
- [Java SDK ソースリポジトリ](https://github.com/milvus-io/milvus-sdk-java)
- [Java SDK のサンプル](https://github.com/milvus-io/milvus-sdk-java/tree/master/examples)

import DocCardList from '@theme/DocCardList';

<DocCardList />
