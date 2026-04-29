---
title: "VectorDB 監査ログ | Cloud"
slug: /audit-logs
sidebar_key: audit-logs
sidebar_label: "VectorDB 監査ログ"
beta: FALSE
notebook: FALSE
description: "監査ログ機能により、管理者は Zilliz Cloud クラスターにおけるユーザー操作や API コールを追跡・監視できます。この機能は、ベクトル検索、クエリ実行、インデックス管理、その他のデータ操作など、ベクトルデータベースのアクティビティの詳細な記録を提供します。| Cloud"
type: origin
token: M5dXwsGOOiPdAjkWLZUc2Pxonuh
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 監査
  - ログ
  - 設定

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# VectorDB 監査ログ

監査ログにより、管理者は Zilliz Cloud クラスターにおけるユーザー駆動型の運用および API コールを追跡・監視できます。この機能は、ベクトル検索、クエリ実行、インデックス管理、その他のデータ操作など、Vector DB 活動の詳細な記録を提供します。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>監査ログは、<strong>Enterprise</strong> プロジェクト以上のプランティアを持つ<strong>Dedicated</strong> クラスターでのみ利用可能です。</p></li>
<li><p>監査ログは、Milvus 2.5.x 以降を実行している Zilliz Cloud クラスターでのみサポートされています。</p></li>
<li><p>監査ログは、<a href="./integrate-with-aws-s3">AWS S3</a>、<a href="./integrate-with-azure-blob-storage">Azure Blob Storage</a>、または <a href="./integrate-with-gcp">Google Cloud Storage</a> に転送できます。</p></li>
<li><p>監査ログを有効にすると料金が発生します。詳細については、<a href="./audit-log-cost">監査ログ</a> をご覧ください。</p></li>
</ul>

</Admonition>

## 概要\{#overview}

監査ログは、データプレーン上の幅広い運用を追跡します。これには以下が含まれます：

- **検索およびクエリ運用**: ベクトル検索、ハイブリッド検索、およびクエリ運用。

- **データ Management**: インデックス作成、コレクション作成、パーティション管理、および挿入、削除、アップサートなどのエンティティ運用。

- **システムイベント**: ユーザーアクセス 試行、認証チェック、およびその他の事前定義されたアクション。

<Admonition type="info" icon="📘" title="Notes">

<p>移行、バックアップ、リストアなどのクラスターレベルのデータジョブは、監査ログを生成しません。これらの活動記録を表示するには、<a href="./view-activities">View Activities</a> を参照してください。</p>

</Admonition>

監査ログは、定期的な間隔でユーザーが指定したオブジェクトストレージバケットに直接転送されます。ログは、容易なアクセスと管理のために構造化された ファイルパス および命名形式で保存されます：

- **ファイルパス**: `/<クラスターID>/<Log type>/<Date>`

- **ファイル命名規則**: *HH:MM:SS-&#36;UUID* 形式の `<File name><File name suffix>`。ここで、*HH:MM:SS* は UTC 時刻を表し、*&#36;UUID* は固有のランダム文字列です。例：`09:16:53-jz5l7D8Q`。

以下は、バケットに転送された監査ログエントリーの例です：

- **Create Collection**

    ```json
    {
      "action": "CreateCollection",
      "cluster_id": "in01-0045a626277eafb",
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
      "cluster_id": "in01-0045a626277eafb",
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

- **インデックスの削除**

    ```json
    {
      "action": "DropIndex",
      "cluster_id": "in01-0045a626277eafb",
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

詳細なサポート対象アクションと対応するログフィールドの一覧については、[監査ログリファレンス](./audit-logs-ref) を参照してください。

## 監査ログの有効化\{#enable-audit-log}

Zilliz Cloud での監査ログ記録は、監査ログをストレージバケットに直接転送します。

### 開始前に\{#before-you-start}

- Zilliz Cloud クラスターが**Dedicated-Enterprise**プラン以上で実行されていること。必要に応じて [プランをアップグレード](./manage-cluster) してください。

- 監査ログは設定後にバケットへ転送されるため、Zilliz Cloud プロジェクトをオブジェクトストレージと統合済みであること。詳細な手順については、[AWS S3 との統合](./integrate-with-aws-s3)、[Azure Blob Storage との統合](./integrate-with-azure-blob-storage)、または [Google Cloud Storage との統合](./integrate-with-gcp) を参照してください。

- プロジェクトに対して**組織オーナー**または**プロジェクト管理者**のアクセス権限を持っていること。必要な権限を持っていない場合は、Zilliz Cloud 管理者にお問い合わせください。

### 手順\{#procedure}

<Supademo id="cmei9fcd99br6h3pydbp52sv8" title="Zilliz Cloud - Enable audit log" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 左側のナビゲーションペインで、**Clusters** を選択します。

1. 対象クラスターの詳細ページに移動し、**監査** タブを選択します。このタブは、クラスターのステータスが**CREATING**、**DELETING**、または**DELETED**の場合は利用できません。

1. **Enable 監査ログ** をクリックします。

1. **Enable 監査ログ** ダイアログボックスで、オブジェクトストレージの統合設定を指定します。

    - **ストレージ統合**: 監査ログを保存するバケットを選択します。

        <Admonition type="info" icon="📘" title="Notes">

        <p>ドロップダウンリストには、クラスターと同じリージョンにあるバケットのみが表示されます。</p>

        </Admonition>

    - **転送ディレクトリ**: 監査ログを保存するためのバケット内のディレクトリを指定します。

1. **Enable** をクリックします。**監査ログ** のステータスが**Active**になれば、正常に有効化されています。ステータスが**異常**の場合は、[FAQ](./audit-logs#faq) でトラブルシューティングを行ってください。

</Procedures>

設定が完了すると、監査ログは約 5 分間隔でバケットに転送されます。必要に応じてバケットにアクセスしてログを表示または管理できます。

監査ログが S3 バケットに転送された後、S3 ストレージを可視化プラットフォームと統合して、監視と分析を強化できます。たとえば、Snowflake を使用してより深い洞察を得たい場合は、[Amazon S3 用の Snowpipe の自動化](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3) を参照してください。

ログエントリ内のパラメーターを理解するには、[監査ログ](./audit-logs-ref) を参照してください。

## 監査ログの管理\{#manage-audit-logs}

監査ログが有効になると、必要に応じてその設定を編集したり、無効にしたりできます。

![XyvNb9sf1oGSKox0XxWc2BFAnrg](https://zdoc-images.s3.us-west-2.amazonaws.com/xyvnb9sf1ogskox0xxwc2bfanrg.png "XyvNb9sf1oGSKox0XxWc2BFAnrg")

## FAQ\{#faq}

この FAQ では、Zilliz Cloud での監査ログ記録に関する一般的な問題と質問に対応しています。さらにサポートが必要な場合は、[Zilliz Cloud サポート](https://support.zilliz.com/hc/en-us) までお問い合わせください。

- **監査ログ のステータスが異常の場合、どうすればよいですか？**

    **異常**ステータスは、監査ログに問題が発生していることを意味します。以下の手順に従ってトラブルシューティングを行ってください。

    1. **バケットの確認**: 設定済みのストレージバケットが正しく設定されており、必要な権限があることを確認します。

    1. **サポートへの連絡**: 問題が解決しない場合は、[Zilliz Cloud サポート](https://support.zilliz.com/hc/en-us) までお問い合わせください。

- **クラスターのステータスが異常でも、監査ログ サービスに影響しますか？**

    異常なクラスターステータスは、ネットワーク接続の問題や Zilliz Cloud サービスの中断など、クラスターに問題が発生している可能性を示しています。ただし、これらの問題は監査ログサービスには影響せず、サービスは通常どおり機能し、期待通りにログを転送し続けます。持続的な問題が発生した場合は、[Zilliz Cloud サポート](https://support.zilliz.com/hc/en-us) までお問い合わせください。

