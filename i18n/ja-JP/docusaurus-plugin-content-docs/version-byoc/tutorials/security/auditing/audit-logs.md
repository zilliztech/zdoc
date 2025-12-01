---
title: "VectorDB監査ログ | BYOC"
slug: /audit-logs
sidebar_label: "VectorDB監査ログ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "監査ログを使用すると、管理者はZilliz Cloudクラスターでのユーザー主導の操作およびAPI呼び出しを追跡および監視できます。この機能は、ベクトル検索、クエリ実行、インデックス管理、およびその他のデータ操作を含むベクトルDB活動の詳細な記録を提供します。 | BYOC"
type: origin
token: M5dXwsGOOiPdAjkWLZUc2Pxonuh
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - 監査
  - ログ
  - 構成
  - RAGベクトルデータベース
  - ベクトルDBとは何か
  - ベクトルデータベースとは
  - ベクトルデータベース比較

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# VectorDB監査ログ

監査ログを使用すると、管理者はZilliz Cloudクラスターでのユーザー主導の操作およびAPI呼び出しを追跡および監視できます。この機能は、ベクトル検索、クエリ実行、インデックス管理、およびその他のデータ操作を含むベクトルDB活動の詳細な記録を提供します。

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><p>監査ログは、<strong>Enterprise</strong>プロジェクトまたはそれ以上のプランティアの<strong>専用</strong>クラスターでのみ利用可能です。</p></li>
<li><p>監査ログは、Milvus 2.5.xを実行するZilliz Cloudクラスターでのみサポートされます。</p></li>
<li><p>監査ログは<a href="./integrate-with-aws-s3">AWS S3</a>、<a href="./integrate-with-azure-blob-storage">Azure Blob Storage</a>、または<a href="./integrate-with-gcp">Google Cloud Storage</a>に転送できます。</p></li>
<li><p>監査ログを有効にすると料金が発生します。詳細については、<a href="./audit-log-cost">監査ログ</a>を参照してください。</p></li>
</ul>

</Admonition>

## 概要\{#overview}

監査ログは、データプレーンでの以下を含む幅広い操作を追跡します：

- **検索およびクエリ操作**：ベクトル検索、ハイブリッド検索、およびクエリ操作。

- **データ管理**：インデックス作成、コレクション作成、パーティション管理、および挿入、削除、アップサートなどのエンティティ操作。

- **システムイベント**：ユーザーのアクセス試行、認証チェック、およびその他の事前定義されたアクション。

<Admonition type="info" icon="📘" title="注意">

<p>移行、バックアップ、およびリストアなどのクラスターレベルのデータジョブは監査ログを生成しません。これらの活動記録を表示するには、<a href="./view-activities">活動の表示</a>を参照してください。</p>

</Admonition>

監査ログは、定期的にユーザーが指定したオブジェクトストレージバケットに直接転送されます。ログは、アクセスおよび管理が容易になるように構造化されたファイルパスおよび命名形式で保存されます：

- **ファイルパス**：`/<クラスターID>/<ログタイプ>/<日付>`

- **ファイル命名規則**：`<ファイル名><ファイル名サフィックス>`で、形式は*HH:MM:SS-&#36;UUID*、*HH:MM:SS*はUTCでの時刻を表し、*&#36;UUID*は一意のランダム文字列です。例：`09:16:53-jz5l7D8Q`。

以下は、バケットに転送された監査ログエントリの例です：

- **コレクション作成**

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

- **インデックス作成**

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

- **インデックス削除**

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

サポートされているアクションおよび対応するログフィールドの詳細なリストについては、[監査ログリファレンス](./audit-logs-ref)を参照してください。

## 監査ログの有効化\{#enable-audit-log}

Zilliz Cloudの監査ログは、監査ログを直接ストレージバケットに転送します。

### 事前準備\{#before-you-start}

- プロジェクトに**組織オーナー**または**プロジェクト管理者**としてアクセスできること。必要な権限がない場合は、Zilliz Cloud管理者にお問い合わせください。

### 手順\{#procedure}

<Supademo id="cmei9fcd99br6h3pydbp52sv8" title="Zilliz Cloud - Enable audit log" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 左側のナビゲーションペインで、**クラスター**を選択します。

1. 対象クラスターの詳細ページに移動し、**監査**タブを選択します。このタブは、クラスターが**作成中**、**削除中**、または**削除済**のステータスにある場合は利用できません。

1. **監査ログの有効化**をクリックします。

1. **監査ログの有効化**ダイアログボックスで、オブジェクトストレージ統合設定を指定します。

    - **ストレージ統合**：監査ログを保存するバケットを選択します。

        <Admonition type="info" icon="📘" title="注意">

        <p>クラスターと同じリージョンにあるバケットのみがドロップダウンリストに表示されます。</p>

        </Admonition>

    - **転送ディレクトリ**：監査ログを保存するバケット内のディレクトリを指定します。

1. **有効化**をクリックします。**監査ログ**ステータスが**有効**になると、正常に有効化されました。ステータスが**異常**の場合は、[FAQ](./audit-logs#faq)を参照してトラブルシューティングしてください。

設定後、監査ログは約5分間隔でバケットに転送されます。必要に応じてバケットにアクセスしてログを表示または管理できます。

監査ログがS3バケットに転送されたら、S3ストレージを視覚化プラットフォームに統合して、強化された監視および分析を行うことができます。たとえば、Snowflakeを使用してより深い洞察を得たい場合は、[Amazon S3用Snowpipeの自動化](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3)を参照してください。

ログエントリのパラメータを理解するには、[監査ログ](./audit-logs-ref)を参照してください。

## 監査ログの管理\{#manage-audit-logs}

監査ログが有効化されると、必要に応じて構成を編集したり、無効化したりできます。

![XyvNb9sf1oGSKox0XxWc2BFAnrg](/img/XyvNb9sf1oGSKox0XxWc2BFAnrg.png)

## FAQ\{#faq}

このFAQでは、Zilliz Cloudの監査ログに関する一般的な問題および質問に対応しています。さらに支援が必要な場合は、[Zilliz Cloudサポート](https://support.zilliz.com/hc/en-us)にお問い合わせください。

- **監査ログのステータスが異常の場合、どうすればよいですか？**

    **異常**ステータスは、監査ログに問題が発生していることを意味します。以下の手順でトラブルシューティングを行ってください：

    1. **バケットの確認**：構成されたストレージバケットが正しく設定され、必要な権限があることを確認してください。

    1. **サポートへの連絡**：問題が解決しない場合は、[Zilliz Cloudサポート](https://support.zilliz.com/hc/en-us)に連絡してさらに支援を受けてください。

- **異常なクラスターステータスは監査ログサービスに影響しますか？**

    異常なクラスターステータスは、クラスターにネットワーク接続の問題やZilliz Cloudサービスの中断などの問題が発生している可能性があることを示します。ただし、これらの問題は監査ログサービスに影響せず、正常に機能し、ログを期待通りに転送し続けます。継続的な問題が発生した場合は、[Zilliz Cloudサポート](https://support.zilliz.com/hc/en-us)にお問い合わせください。