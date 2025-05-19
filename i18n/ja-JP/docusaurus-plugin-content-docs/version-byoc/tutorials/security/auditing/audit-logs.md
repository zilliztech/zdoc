---
title: "監査ロギング | BYOC"
slug: /audit-logs
sidebar_label: "監査ロギング"
beta: PRIVATE
notebook: FALSE
description: "監査ログにより、管理者はZilliz Cloudクラスター上のユーザー主導の操作やAPI呼び出しを追跡および監視できます。この機能により、ベクトル検索、クエリ実行、インデックス管理、その他のデータ操作を含むデータプレーンアクティビティの詳細な記録が提供されます。セキュリティレビュー、コンプライアンス監査、問題解決のためにデータがどのようにアクセスおよび管理されているかを可視化します。 | BYOC"
type: origin
token: GqSCwvPmIi6Ulwk4nJAcJJSonJd
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - auditing
  - log
  - configure
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database

---

import Admonition from '@theme/Admonition';


# 監査ロギング

監査ログにより、管理者はZilliz Cloudクラスター上のユーザー主導の操作やAPI呼び出しを追跡および監視できます。この機能により、ベクトル検索、クエリ実行、インデックス管理、その他のデータ操作を含むデータプレーンアクティビティの詳細な記録が提供されます。セキュリティレビュー、コンプライアンス監査、問題解決のためにデータがどのようにアクセスおよび管理されているかを可視化します。

## 概要について{#overview}

監査ログは、データプレーン上のさまざまな操作を追跡します。

検索およびクエリ操作:ベクトル検索、ハイブリッド検索、およびクエリ操作。

データ管理:インデックスの作成、コレクションの作成、パーティションの管理、挿入、削除、upsertなどのエンティティ操作。

システムイベント:ユーザーのアクセス試行、承認チェック、およびその他の定義済みアクション。

<Admonition type="info" icon="📘" title="ノート">

<p>コントロールプレーン上のクラスターレベルの操作（移行、バックアップ、復元など）は監査ログを生成しません。これらのアクティビティレコードを表示するには、「<a href="./view-activities">アクティビティを見る</a>」を参照してください。</p>

</Admonition>

監査ログは、定期的にユーザーが指定したオブジェクトストレージバケットに直接ストリーミングされます。ログは、構造化されたファイルパスと命名形式で保存され、簡単にアクセスして管理できます。

- **ファイルパス**:`/<Cluster ID>/<Log type>/<Date>`

- **ファイルの命名規則**:`\<File name><File name suffix>`を*HH: MM:SS-UUID*の形式で指定します。ここで、*HH:MM:SS*はUTCで時刻を表し、*UUID*は一意のランダム文字列です。例:`09:16:53-jz5l7D8Q`。

以下は、バケットにストリーミングされた監査ログエントリの例です。

```json
{
    "date": "2025-01-21T08:45:56.556286Z",
    "action": "CreateAlias",
    "cluster_id": "in01-b5a7e190615ef9f",
    "database": "database2",
    "interface": "Restful",
    "log_type": "AUDIT",
    "params": {
        "collection": "collection1"
    },
    "status": "Receive",
    "time": 1737449156556,
    "trace_id": "b599063b9d0cfcf9d756ddbbef56ab5b",
    "user": "zcloud_apikey_admin"
}
```

サポートされているアクションと対応するログフィールドの詳細なリストについては、「[監査ログの参照](./audit-logs-ref)」を参照してください。

## 監査ログのストリーミングを有効にする{#enable-audit-log-streaming}

Zilliz Cloudの監査ログは、監査ログを直接ストレージバケットにストリーミングします。

### 始める前に{#enable-audit-log-streaming}

- **組織のオーナー**または**プロジェクト管理者**がプロジェクトにアクセスできます。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

### 手続き{#procedure}

![configure-auditing-1](/img/configure-auditing-1.png)

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 左側のナビゲーションウィンドウで、[**Clusters**]を選択します。

1. ターゲットクラスタの詳細ページに移動し、[**Auditing**]タブを選択します。クラスタが**CREATING**、**DELETING**、または**DELETED**ステータスの場合、このタブは利用できません。

1. [**Enable Audit Log Streaming**]をクリックします。

1. [**Enable Audit Log Streaming**]ダイアログボックスで、オブジェクトストレージの統合設定を指定します。

    - **Integrations**:オブジェクトストレージをホストするクラウドプロバイダを表示します。

    - **Integration Configuration**:監査ログを保存するバケットを選択します。

        <Admonition type="info" icon="📘" title="ノート">

        <p>ドロップダウンリストには、クラスターと同じリージョンのバケットのみが表示されます。</p>

        </Admonition>

    - **Export Directory**:監査ログを保存するバケット内のディレクトリを指定してください。

1. [**Enable**]をクリックします。[**Audit Log Streaming**]ステータスが[**Active**]になると、正常に有効になります。ステータスが異常の場合は、トラブルシューティングのために[FAQ](./audit-logs#faq)にアクセスしてください。

設定が完了すると、監査ログは約5分ごとにバケットにストリーミングされます。必要に応じてバケットにアクセスしてログを表示または管理できます。

ログエントリのパラメータを理解するには、「[監査ログの参照](./audit-logs-ref)」を参照してください。

## 監査ログのストリーミングを管理する{#manage-audit-log-streaming}

監査ログストリーミングが有効になると、その構成を編集したり、必要に応じて無効にしたりできます。

![configure-auditing-2](/img/configure-auditing-2.png)

## FAQ{#faq}

このFAQでは、Zilliz Cloudの監査ログに関する一般的な問題や質問について説明しています。詳細については、[Zilliz Cloudサポート](https://zilliz.com/contact-sales)にお問い合わせください。

- **クラスタの詳細ページに[Auditing]タブが見つからないのはなぜですか?**

    監査タブは現在、**プライベートプレビュー**の一環としてホワイトリストに追加されたユーザーのみが利用できます。この機能にアクセスしたい場合は、[Zilliz Cloudサポート](https://zilliz.com/contact-sales)にお問い合わせください。

- **監査ログのストリーミングステータスが異常な場合はどうすればよいですか?**

    異常なステータスは、監査ログストリーミングに問題が発生していることを意味します。以下の手順に従ってトラブルシューティングを行ってください。

    - **接続を確認してください**:ネットワーク接続が安定しており、ファイアウォールやVPN設定がZilliz Cloudへのアクセスをブロックしていないことを確認してください。

    - **バケットの確認**:構成されたストレージバケットが正しく設定されていること、および必要なアクセス許可があることを確認します。

    - **サポートへのお問い合わせ**:問題が解決しない場合は、[Zilliz Cloudサポート](https://zilliz.com/contact-sales)にお問い合わせください。

- **異常なクラスターの状態は、監査ログストリーミングサービスに影響しますか?**

    異常なクラスター状態は、ネットワーク接続の問題やZilliz Cloudサービスの中断などの問題が発生している可能性があることを示しています。ただし、これらの問題はAudit Log Streamingサービスには影響しません。Audit Log Streamingサービスは正常に機能し、ログを期待どおりにストリーミングします。持続的な問題が発生した場合は、[Zilliz Cloudサポート](https://zilliz.com/contact-sales)にお問い合わせください。