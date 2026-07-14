---
title: "VectorDB 監査ログ | Cloud"
slug: /audit-logs
sidebar_label: "VectorDB 監査ログ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "監査ログを使用すると、管理者は Zilliz Cloud クラスター上のユーザー主導の操作や API 呼び出しを追跡および監視できます。この機能は、ベクトル DB アクティビティの詳細な記録を提供し、ベクトル検索、クエリ実行、インデックス管理、その他のデータ操作を含みます。 | Cloud"
type: origin
token: M5dXwsGOOiPdAjkWLZUc2Pxonuh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# VectorDB 監査ログ

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上、および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

監査ログを使用すると、管理者は Zilliz Cloud クラスター上のユーザー主導の操作や API 呼び出しを追跡および監視できます。この機能は、ベクトル DB アクティビティの詳細な記録を提供し、ベクトル検索、クエリ実行、インデックス管理、その他のデータ操作を含みます。

<Admonition type="info" icon="📘" title="注意">

- 監査ログは、Milvus 2.5.x 以降を実行している Zilliz Cloud クラスターでのみサポートされます。

- 監査ログは [AWS S3](./integrate-with-aws-s3)、[Azure Blob Storage](./integrate-with-azure-blob-storage)、または [Google Cloud Storage](./integrate-with-gcp) に転送できます。

- 監査ログを有効にすると課金が発生します。詳細については、[Audit Logs Cost](./audit-log-cost) を参照してください。

</Admonition>

## 概要\{#overview}

監査ログは、データプレーン上の幅広い操作を追跡します。これには次が含まれます。

- **検索およびクエリ操作**: ベクトル検索、ハイブリッド検索、およびクエリ操作。

- **データ管理**: インデックス作成、コレクション作成、パーティション管理、および insert、delete、upsert などのエンティティ操作。

- **システムイベント**: ユーザーアクセス試行、認可チェック、その他の定義済みアクション。

<Admonition type="info" icon="📘" title="注意">

migration、backup、restore などのクラスター レベルのデータジョブでは監査ログは生成されません。これらのアクティビティ記録を表示するには、[View Activities](./view-activities) を参照してください。

</Admonition>

監査ログは、定期的にユーザーが指定したオブジェクトストレージバケットへ直接転送されます。ログは、アクセスと管理を容易にするため、構造化されたファイルパスおよび命名形式で保存されます。

- **ファイルパス**: `/<Cluster ID>/<Log type>/<Date>`

- **ファイル命名規則**: `<File name><File name suffix>` は *HH:MM:SS-&#36;UUID* 形式で、*HH:MM:SS* は UTC の時刻、*&#36;UUID* は一意のランダム文字列を表します。例: `09:16:53-jz5l7D8Q`。

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

サポートされるアクションと対応するログフィールドの詳細な一覧については、[Audit Log Reference](./audit-logs-ref) を参照してください。

## 監査ログを有効にする\{#enable-audit-log}

Zilliz Cloud の監査ログ機能は、監査ログをストレージバケットへ直接転送します。

### 開始する前に\{#before-you-start}

- お使いの Zilliz Cloud クラスターが **Dedicated-Enterprise** プラン階層以上で実行されていること。必要に応じて [Upgrade your plan](./manage-cluster) を行ってください。

- 監査ログは設定後にバケットへ転送されるため、Zilliz Cloud プロジェクトをオブジェクトストレージと統合していること。詳細な手順については、[Integrate with AWS S3](./integrate-with-aws-s3)、[Integrate with Azure Blob Storage](./integrate-with-azure-blob-storage)、または [Integrate with Google Cloud Storage](./integrate-with-gcp) を参照してください。

- プロジェクトに対する **Organization Owner** または **Project Admin** アクセス権限を持っていること。必要な権限がない場合は、Zilliz Cloud 管理者にお問い合わせください。

### 手順\{#procedure}

<Supademo id="cmei9fcd99br6h3pydbp52sv8" title=""  />

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) にログインします。

1. 左側のナビゲーションペインで **Clusters** を選択します。

1. 対象クラスターの詳細ページに移動し、**Logs** タブを選択します。クラスターが **CREATING**、**DELETING**、または **DELETED** ステータスの場合、このタブは使用できません。

1. **Audit Logs** カード内の **Configure** をクリックします。

1. **Audit Logs Settings** ダイアログボックスで、オブジェクトストレージ統合設定を指定します。

    - **Storage Integration**: 監査ログの保存先となるバケットを選択します。

        <Admonition type="info" icon="📘" title="注意">

        クラスターと同じリージョン内のバケットのみがドロップダウンリストに表示されます。

        </Admonition>

    - **Forward Directory**: 監査ログを保存するバケット内のディレクトリを指定します。

1. **Save** をクリックします。**Audit Logs** のステータスが **Active** になれば、有効化は正常に完了しています。ステータスが **Abnormal** の場合は、トラブルシューティングのために [FAQ](./audit-logs#faq) を参照してください。

</Procedures>

設定が完了すると、監査ログは約 5 分間隔でバケットに転送されます。必要に応じてバケットにアクセスし、ログを表示または管理できます。

監査ログが S3 バケットに転送されると、監視や分析を強化するために、S3 ストレージを可視化プラットフォームと統合できます。たとえば、より深い分析のために Snowflake を使用したい場合は、[Automating Snowpipe for Amazon S3](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3) を参照してください。

ログエントリ内のパラメータを理解するには、[Audit Logs](./audit-logs-ref) を参照してください。

## 監査ログを管理する\{#manage-audit-logs}

監査ログを有効にすると、必要に応じてその設定を編集したり、無効にしたりできます。

![WaxlwwFpVhjeVKbfgWScdKQKnqW](https://zdoc-images.s3.us-west-2.amazonaws.com/WaxlwwFpVhjeVKbfgWScdKQKnqW.png)

## FAQ\{#faq}

この FAQ では、Zilliz Cloud の監査ログに関する一般的な問題と質問を扱います。さらに支援が必要な場合は、[Zilliz Cloud support](https://support.zilliz.com/hc/en-us) にお問い合わせください。

- **Audit Log のステータスが Abnormal の場合はどうすればよいですか？**

    **Abnormal** ステータスは、Audit Log で問題が発生していることを意味します。トラブルシューティングのために次の手順に従ってください。

    1. **バケットを確認する:** 設定されたストレージバケットが正しくセットアップされており、必要な権限があることを確認します。

    1. **サポートに連絡する:** 問題が解決しない場合は、追加の支援を受けるために [Zilliz Cloud support](https://support.zilliz.com/hc/en-us) にお問い合わせください。

- **クラスターの Abnormal ステータスは Audit Log サービスに影響しますか？**

    クラスターの異常ステータスは、ネットワーク接続の問題や Zilliz Cloud サービスの中断など、クラスターで問題が発生している可能性があることを示します。ただし、これらの問題は Audit Log サービスには影響せず、通常どおり動作して期待どおりにログを転送し続けます。問題が継続する場合は、[Zilliz Cloud support](https://support.zilliz.com/hc/en-us) にお問い合わせください。

