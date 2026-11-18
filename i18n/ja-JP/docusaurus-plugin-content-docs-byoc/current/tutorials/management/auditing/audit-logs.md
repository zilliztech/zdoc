---
title: "VectorDB 監査ログ | BYOC"
slug: /audit-logs
sidebar_label: "VectorDB 監査ログ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "VectorDB 監査ログを使用すると、検索、クエリ、コレクション、インデックス、データの変更など、クラスター上の操作を調査できます。これらのログを、保持のためにオブジェクトストレージへ、またはログシステムで処理するために HTTPS エンドポイントへ転送します。 | BYOC"
type: origin
token: FrKYwyBXKiktPzkQcFXco2qUnYd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# VectorDB 監査ログ

VectorDB 監査ログを使用すると、検索、クエリ、コレクション、インデックス、データの変更など、クラスター上の操作を調査できます。これらのログを、保持のためにオブジェクトストレージへ、またはログシステムで処理するために HTTPS エンドポイントへ転送します。

クラスターのバックアップ、リストア、移行などの管理アクティビティについては、[Platform Audit Logs](./view-activities) を参照してください。

## 事前準備\{#before-you-start}

- Enterprise プラン以上で Dedicated クラスターを使用していること。

- **Organization Owner** または **Project Admin** としてサインインし、監査ログ設定を管理できるよう、クラスターが稼働中であることを確認すること。

- 監査ログとアクセスログのいずれかを選択すること。これらは同じクラスターで同時に有効化できません。スローログは別途設定します。

- **クラスターと同じプロジェクト内**で転送先の統合を作成すること。ログを使用する場所に応じて転送先を選択してください。

    | 転送先 | 準備するもの |
    | --- | --- |
    | オブジェクトストレージ | ログを保持するためのバケットまたはコンテナと、そのプロジェクト統合です。[Amazon S3](./integrate-with-aws-s3)、[Google Cloud Storage](./integrate-with-gcp)、または [Azure Blob Storage](./integrate-with-azure-blob-storage) の設定手順に従ってください。 |
    | HTTPS エンドポイント | HTTPS 経由でログを受け付けるサービス、および URL と認証設定を構成した統合です。サービスを準備して統合をテストするには、[HTTPS エンドポイント統合](./integrate-with-https-endpoint) の手順に従ってください。 |

<Admonition type="info" title="Notes">

既存の BYOC 監査ログ設定では、ログはデータプレーンに設定されたオブジェクトストレージに書き込まれます。監査ログを有効化または設定するには、[サポート](https://support.zilliz.com/hc/en-us) にお問い合わせください。

</Admonition>

## 監査ログ転送を有効にする\{#enable-audit-log-forwarding}

**パフォーマンスとコスト：** 監査ログは、クエリと書き込みのパフォーマンスに影響する可能性があり、監査ログの CU コストが発生します。有効にする前に、[監査ログのコスト](./audit-log-cost) を確認してください。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) でプロジェクトを開き、対象のクラスターを選択します。

1. **Logs** タブを開きます。**Audit Logs** カードで **Configure** をクリックします。

1. **Audit Logs Settings** で、**Send To** から転送先を選択し、出力を設定します。

    | 設定 | 選択する内容 |
    | --- | --- |
    | Send To | このプロジェクトで準備した統合を選択します。オブジェクトストレージの場合は、この設定によってバケットまたはコンテナが特定されます。HTTPS の場合は、受信サービスが特定されます。 |
    | Format | ダウンストリームのパーサーまたはログシステムでサポートされている形式を、使用可能なオプションから選択します：**JSON**、**ECS**、**OTel**（OpenTelemetry）。 |
    | Forward directory<br/>（オブジェクトストレージのみ） | バケットまたはコンテナ内のログを保存する場所を選択します。パスのプレビューを確認して、このクラスターの監査ログをどこで確認できるかを把握してください。HTTPS 転送ではディレクトリを使用しません。 |

1. 設定を確認し、**Start Forwarding** をクリックします。

1. 監査ログのステータスが **Active** になるまで待ち、ログが転送先に届くことを確認します。

</Procedures>

## ログが届くことを確認する\{#verify-that-logs-arrive}

<Procedures>

1. 監査ログが有効になったら、既存のコレクションに対するクエリなど、サポートされている操作をクラスターで実行します。操作の時刻を記録します。

1. その時刻前後に、設定した転送先でこのクラスターからの新しいログレコードを確認します。

    | 転送先 | 確認場所 |
    | --- | --- |
    | オブジェクトストレージ | バケットまたはコンテナを開き、設定に表示されているディレクトリを特定します。新しいログオブジェクトを検査し、操作に対応するレコードを見つけます。 |
    | HTTPS エンドポイント | 受信サービスの取り込み記録または保存済みログで、該当する操作を確認します。統合テストが成功しても、実際のクラスターログの配信確認に代わるものではありません。 |

</Procedures>

サポートされている操作とフィールド定義については、[VectorDB Audit Logs Reference](./audit-logs-ref) を参照してください。

## よくある質問\{#faq}

- **監査ログ設定を開けないのはなぜですか？**

    クラスターが稼働中であり、必要なロールとプランがあることを確認してください。一時停止中のクラスターでは、Logs タブに **Auditing Unavailable** と表示されます。

- **ログが届かない場合は何を確認すればよいですか？**

    監査ログのステータスと、コンソールに表示されるエラーを確認してください。ログが有効になった後にサポートされている操作が実行されたことを確認します。オブジェクトストレージの場合は、設定したディレクトリと書き込み権限を確認してください。HTTPS の場合は、受信側の可用性、認証、取り込みエラーを確認してください。問題が解決しない場合は、クラスター ID、操作の時刻、エラーメッセージを添えて [サポート](https://support.zilliz.com/hc/en-us) にお問い合わせください。
