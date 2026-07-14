---
title: "VectorDB 監査ログ | BYOC"
slug: /audit-logs
sidebar_label: "VectorDB 監査ログ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "監査ログにより、管理者は Zilliz Cloud クラスター上でユーザー主導の操作や API 呼び出しを追跡・監視できます。この機能は、ベクトル検索、クエリ実行、インデックス管理、その他のデータ操作など、ベクトル DB のアクティビティの詳細な記録を提供します。 | BYOC"
type: origin
token: M5dXwsGOOiPdAjkWLZUc2Pxonuh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# VectorDB 監査ログ

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイでのみ利用できます。

</FeatureNote>

監査ログにより、管理者は Zilliz Cloud クラスター上でユーザー主導の操作や API 呼び出しを追跡・監視できます。この機能は、ベクトル検索、クエリ実行、インデックス管理、その他のデータ操作など、ベクトル DB のアクティビティの詳細な記録を提供します。

<Admonition type="info" icon="📘" title="注意">

- 監査ログは、Milvus 2.5.x 以降で動作する Zilliz Cloud クラスターでのみサポートされています。

- BYOC デプロイでは、VDB 監査ログはデータプレーンのローカルオブジェクトストレージ（S3/Azure Blob Storage/GCS）で設定されたログバケットに直接書き込まれるため、データがインフラストラクチャの外に出ることはありません。監査ログを有効化して設定するには、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。

</Admonition>

## 概要\{#overview}

監査ログは、以下を含むデータプレーン上の幅広い操作を追跡します。

- **検索およびクエリ操作**: ベクトル検索、ハイブリッド検索、クエリ操作。

- **データ管理**: インデックス作成、コレクション作成、パーティション管理、および insert、delete、upsert などのエンティティ操作。

- **システムイベント**: ユーザーアクセス試行、認可チェック、その他の事前定義されたアクション。

<Admonition type="info" icon="📘" title="注意">

移行、バックアップ、リストアなどのクラスター レベルのデータジョブでは監査ログは生成されません。これらのアクティビティ記録を表示するには、[アクティビティを表示](./view-activities)を参照してください。

</Admonition>

監査ログは、定期的にユーザー指定のオブジェクトストレージバケットへ直接転送されます。ログは、アクセスや管理を容易にするため、構造化されたファイルパスおよび命名形式で保存されます。

- **ファイルパス**: `/<Cluster ID>/<Log type>/<Date>`

- **ファイル命名規則**: `<File name><File name suffix>`（形式: *HH:MM:SS-&#36;UUID*）で、*HH:MM:SS* は UTC 時刻を表し、*&#36;UUID* は一意のランダム文字列です。例: `09:16:53-jz5l7D8Q`。

以下は、バケットに転送される監査ログエントリの例です。

- **Create Collection**

    ```json
    {
      "action": "CreateCollection",
      "cluster_id": "inxx-xxxxxxxxxxxxxxx",
      "connection_uid": 456912553983082500,
      "database": "default",
      "interface": "Grpc",
      "log_type": "AUDIT",
      "params": {
        "collection": "test_audit",
        "consistency_level": 2
      },
      "status": "Receive",
      "timestamp": 1742983070463,
      "trace_id": "216a8129c06fd3d93a47bd69fa0a65ad",
      "user": "key-hwjsxhwppegkatwjaivsgf"
    }
    ```

- **Create Index**

    ```json
    {
      "action": "CreateIndex",
      "cluster_id": "inxx-xxxxxxxxxxxxxxx",
      "connection_uid": 456912553983082500,
      "database": "default",
      "interface": "Grpc",
      "log_type": "AUDIT",
      "params": {
        "collection": "test_audit"
      },
      "status": "Receive",
      "timestamp": 1742983070645,
      "trace_id": "4402e7bfc498dd06be1408c7e6a7954d",
      "user": "key-hwjsxhwppegkatwjaivsgf"
    }
    ```

- **Drop Index**

    ```json
    {
      "action": "DropIndex",
      "cluster_id": "inxx-xxxxxxxxxxxxxxx",
      "connection_uid": 456912553983082500,
      "database": "default",
      "interface": "Grpc",
      "log_type": "AUDIT",
      "params": {
        "collection": "test_audit"
      },
      "status": "Receive",
      "timestamp": 1742983073378,
      "trace_id": "066ec33c3f55d3edbf7d01c6270024e2",
      "user": "key-hwjsxhwppegkatwjaivsgf"
    }
    ```

サポートされているアクションと対応するログフィールドの詳細な一覧については、[監査ログリファレンス](./audit-logs-ref)を参照してください。

<Admonition type="info" icon="📘" title="注意">

監査ログは、データプレーンのデプロイ時に設定されたオブジェクトストレージバケットへ直接転送されます。

ログをさらに分析するためにご利用のロギングシステムへエクスポートするには、[お問い合わせ](https://support.zilliz.com/hc/en-us/requests/new)ください。

</Admonition>

