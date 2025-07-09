---
title: "監査ロギング | Cloud"
slug: /audit-logs
sidebar_label: "監査ロギング"
beta: PRIVATE
notebook: FALSE
description: "監査ログにより、管理者はZilliz Cloudクラスター上のユーザー主導の操作やAPI呼び出しを追跡および監視できます。この機能により、ベクトル検索、クエリ実行、インデックス管理、その他のデータ操作を含むデータプレーンアクティビティの詳細な記録が提供されます。セキュリティレビュー、コンプライアンス監査、および問題解決のためにデータがどのようにアクセスおよび管理されているかを可視化します。 | Cloud"
type: origin
token: M5dXwsGOOiPdAjkWLZUc2Pxonuh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - auditing
  - log
  - configure
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source

---

import Admonition from '@theme/Admonition';


# 監査ロギング

監査ログにより、管理者はZilliz Cloudクラスター上のユーザー主導の操作やAPI呼び出しを追跡および監視できます。この機能により、ベクトル検索、クエリ実行、インデックス管理、その他のデータ操作を含む**データプレーン**アクティビティの詳細な記録が提供されます。セキュリティレビュー、コンプライアンス監査、および問題解決のためにデータがどのようにアクセスおよび管理されているかを可視化します。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>監査ログは<strong>非公開プレビュー</strong>にあります。この機能へのアクセスをリクエストするか、関連するコストについて学ぶには、<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloudサポート</a>にお問い合わせください。</p></li>
<li><p>監査ログは、Milvus 2.5. xを実行しているZilliz Cloudクラスターでのみサポートされています。</p></li>
</ul>

</Admonition>

## 概要について{#overview}

監査ログは、データプレーン上のさまざまな操作を追跡します。

- **検索とクエリ操作**:ベクトル検索、ハイブリッド検索、およびクエリ操作。

- **データ管理**:インデックスの作成、コレクションの作成、パーティションの管理、および挿入、削除、upsertなどのエンティティ操作。

- **システムイベント**:ユーザーのアクセス試行、承認チェック、およびその他の事前定義されたアクション。

<Admonition type="info" icon="📘" title="ノート">

<p>コントロールプレーン上のクラスターレベルの操作（移行、バックアップ、復元など）は監査ログを生成しません。これらのアクティビティレコードを表示するには、<a href="./view-activities">アクティビティを見る</a>を参照してください。</p>

</Admonition>

監査ログは、定期的にユーザーが指定したオブジェクトストレージバケットに直接ストリーミングされます。ログは、構造化されたファイルパスと命名形式で保存され、簡単にアクセスして管理できます。

- **ファイルパス**: `/<Cluster ID>/<Log type>/<Date>`

- ファイル命名規則: `<File name><File name suffix>`は、*HH:MM:SS-$UUID*の形式で表されます。ここで、*HH:MM:SS*はUTCの時間を表し、*$UUID*は一意のランダム文字列です。例:`09:16:53-jz5l7D8Q`。

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

サポートされているアクションと対応するログフィールドの詳細なリストについては、[監査ログの参照](./audit-logs-ref)を参照してください。

## 監査ログのストリーミングを有効にする{#enable-audit-log-streaming}

Zilliz Cloudの監査ログは、監査ログを直接ストレージバケットにストリーミングします。

### 始める前に{#before-you-start}

- Zilliz Cloudクラスターは、**Dedicated-Enterprise**プランレベル以上で実行されます。必要に応じて、[プランをアップグレードしてください](./manage-cluster)を使用してください。

- Zilliz Cloudプロジェクトをオブジェクトストレージと統合しました。設定後、監査ログがバケットにストリーミングされます。詳細な手順については、[AWS S 3との統合](./integrate-with-aws-s3)を参照してください。

</include>

- プロジェクトには**Organization Owner**または**Project Admin**のアクセス権があります。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

### 手続き{#procedure}

![configure-auditing-1](/img/configure-auditing-1.png)

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインしてください。

1. 左側のナビゲーションペインで、**クラスター**を選択してください。

1. ターゲットクラスターの詳細ページに移動し、「監査」タブを選択してください。このタブは、クラスターが「作成中」、「削除中」、または「削除済み」の状態の場合には利用できません。

1. 「監査ログストリーミングを有効にする」をクリックしてください。

1. 「監査ログストリーミングを有効にする」ダイアログボックスで、オブジェクトストレージの統合設定を指定してください。

    - **統合**:オブジェクトストレージをホストするクラウドプロバイダを表示します。

    - **統合構成**:監査ログを保存するバケットを選択してください。

        <Admonition type="info" icon="📘" title="ノート">

        <p>ドロップダウンリストには、クラスターと同じリージョンのバケットのみが表示されます。</p>

        </Admonition>

    - **エクスポートディレクトリ**:監査ログを保存するバケット内のディレクトリを指定してください。

1. 「有効にする」をクリックしてください。監査ログストリーミングのステータスが「アクティブ」になったら、正常に有効になっています。ステータスが「異常」の場合は、トラブルシューティングのために[よくある質問(FAQ)](./audit-logs#faq)に移動してください。

設定が完了すると、監査ログは約5分ごとにバケットにストリーミングされます。必要に応じてバケットにアクセスしてログを表示または管理できます。

監査ログがS 3バケットにストリーミングされたら、S 3ストレージを可視化プラットフォームに統合して、監視と分析を強化できます。例えば、Snowflakeを使用してより深い洞察を得たい場合は、[Amazon S 3用スノーパイプの自動化](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3)を参照してください。

ログエントリのパラメータを理解するには、[監査ログ](./audit-logs-ref)を参照してください。

## 監査ログのストリーミングを管理する{#manage-audit-log-streaming}

監査ログストリーミングが有効になると、その構成を編集したり、必要に応じて無効にしたりできます。

![configure-auditing-2](/img/configure-auditing-2.png)

## よくある質問(FAQ){#faq}

このFAQでは、Zilliz Cloudの監査ログに関する一般的な問題や質問について説明しています。詳細については、[Zilliz Cloudサポート](https://support.zilliz.com/hc/en-us)までお問い合わせください。

- クラスタの詳細ページに監査タブが見つからないのはなぜですか?

    「監査」タブは現在、「プライベートプレビュー」の一環としてホワイトリストに追加されたユーザーのみが利用できます。この機能にアクセスしたい場合は、[Zilliz Cloudサポート](https://support.zilliz.com/hc/en-us)にお問い合わせください。

- **監査ログのストリーミングステータスが異常な場合はどうすればよいですか?**

    **異常**ステータスは、監査ログストリーミングに問題が発生していることを意味します。以下の手順に従ってトラブルシューティングを行ってください:

    1. 接続を確認してください:ネットワーク接続が安定しており、ファイアウォールやVPN設定がZilliz Cloudへのアクセスをブロックしていないことを確認してください。

    1. バケットを確認してください:構成されたストレージバケットが正しく設定され、必要な権限があることを確認してください。

    1. サポートに連絡してください:問題が解決しない場合は、[Zilliz Cloudサポート](https://support.zilliz.com/hc/en-us)に連絡して、さらなるサポートを受けてください。

- **異常なクラスターの状態は、監査ログストリーミングサービスに影響しますか?**

    異常なクラスターステータスは、ネットワーク接続の問題やZilliz Cloudサービスの中断などの問題が発生している可能性があることを示しています。ただし、これらの問題はAudit Log Streamingサービスには影響しません。Audit Log Streamingサービスは正常に機能し、ログを期待どおりにストリーミングします。持続的な問題が発生した場合は、[Zilliz Cloudサポート](https://support.zilliz.com/hc/en-us)に連絡してください。

