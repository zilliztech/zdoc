---
title: "VectorDB 監査ログ | Cloud"
slug: /audit-logs
sidebar_label: "VectorDB 監査ログ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "VectorDB 監査ログを使用して、検索、クエリ、コレクション、インデックス、データの変更など、クラスター上の操作を調査できます。これらのログを、保持目的でオブジェクトストレージへ、またはログ管理システムでの処理目的で HTTPS エンドポイントへ転送できます。 | Cloud"
type: origin
token: FrKYwyBXKiktPzkQcFXco2qUnYd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# VectorDB 監査ログ

VectorDB 監査ログを使用して、検索、クエリ、コレクション、インデックス、データの変更など、クラスター上の操作を調査できます。これらのログを、保持目的でオブジェクトストレージへ、またはログ管理システムでの処理目的で HTTPS エンドポイントへ転送できます。

クラスターのバックアップ、リストア、移行などの管理操作については、[Platform Audit Logs](./view-activities) を参照してください。

## 開始する前に\{#before-you-start}

- Enterprise プラン以上の Dedicated クラスターを使用していること。

- **Organization Owner** または **Project Admin** としてサインインし、クラスターの監査ログ設定を管理できるよう、クラスターが稼働していることを確認すること。

- 監査ログとアクセスログのいずれかを選択すること。これらは 1 つのクラスターで同時に有効にできません。スローログは別途構成します。

- **クラスターと同じプロジェクト**内に転送先の統合を作成すること。ログを使用する場所に応じて転送先を選択してください。

    | 転送先 | 準備するもの |
    | --- | --- |
    | オブジェクトストレージ | ログを保持するためのバケットまたはコンテナーと、そのプロジェクトの統合です。[Amazon S3](./integrate-with-aws-s3)、[Google Cloud Storage](./integrate-with-gcp)、または [Azure Blob Storage](./integrate-with-azure-blob-storage) のセットアップ手順に従ってください。 |
    | HTTPS エンドポイント | HTTPS 経由でログを受け付けるサービスと、その URL および認証設定を備えた統合です。[Integrate with an HTTPS Endpoint](./integrate-with-https-endpoint) に従って、サービスを準備し、統合をテストしてください。 |

<Admonition type="info" title="Notes">

既存の BYOC 監査ログ設定では、ログはデータプレーン用に構成されたオブジェクトストレージに書き込まれます。監査ログを有効化または構成するには、[サポート](https://support.zilliz.com/hc/en-us) にお問い合わせください。

</Admonition>

## 監査ログ転送を有効にする\{#enable-audit-log-forwarding}

**パフォーマンスとコスト：** 監査ログは、クエリおよび書き込みのパフォーマンスに影響する可能性があり、監査ログ CU コストが発生します。有効にする前に、[監査ログのコスト](./audit-log-cost) を確認してください。

<Supademo id="cmwa2w2pm068rqmfqew7gz7kh" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) でプロジェクトを開き、対象のクラスターを選択します。

1. **Logs** タブを開き、**Audit Logs** カードで **Configure** をクリックします。

1. **Audit Logs Settings** で、**Send To** から転送先を選択し、出力を設定します。

    | 設定項目 | 選択する内容 |
    | --- | --- |
    | Send To | このプロジェクトで準備した統合を選択します。オブジェクトストレージの場合は、バケットまたはコンテナーを識別します。HTTPS の場合は、受信サービスを識別します。 |
    | Format | 使用可能なオプションから、ダウンストリームのパーサーまたはログ管理システムでサポートされている形式を選択します：**JSON**、**ECS**、または **OTel**（OpenTelemetry）。 |
    | Forward directory<br/>（オブジェクトストレージのみ） | バケットまたはコンテナー内でログを保存する場所を選択します。パスのプレビューを確認して、このクラスターの監査ログの場所を把握できるようにします。HTTPS 転送ではディレクトリを使用しません。 |

1. 構成を確認してから、**Start Forwarding** をクリックします。

1. 監査ログのステータスが **Active** になるまで待ち、ログが転送先に到達していることを確認します。

</Procedures>

## ログの到着を確認する\{#verify-that-logs-arrive}

<Procedures>

1. 監査ログが有効になったら、既存のコレクションに対するクエリなど、サポートされている操作をクラスター上で実行します。操作時刻を控えておいてください。

1. その時刻前後に、設定した転送先でこのクラスターからの新しいログレコードを確認します。

    | 転送先 | 確認場所 |
    | --- | --- |
    | オブジェクトストレージ | バケットまたはコンテナーを開き、構成に表示されているディレクトリを特定します。新しいログオブジェクトを確認し、操作のレコードを見つけます。 |
    | HTTPS エンドポイント | 受信サービスの取り込み記録または保存されているログで、対象の操作を確認します。統合テストが成功しても、実際のクラスターログの配信確認の代わりにはなりません。 |

</Procedures>

サポートされている操作とフィールド定義については、[VectorDB 監査ログ リファレンス](./audit-logs-ref) を参照してください。

## FAQ\{#faq}

- **監査ログ設定を開けないのはなぜですか？**

    クラスターが稼働していること、および必要なロールとプランがあることを確認してください。一時停止中のクラスターでは、Logs タブに **Auditing Unavailable** と表示されます。

- **ログが到着しない場合は何を確認すればよいですか？**

    監査ログのステータスと、コンソールに表示されるエラーを確認してください。ログが有効になった後にサポート対象の操作が実行されたことを確認してください。オブジェクトストレージの場合は、設定したディレクトリと書き込み権限を確認してください。HTTPS の場合は、レシーバーの可用性、認証、取り込みエラーを確認してください。問題が解決しない場合は、クラスター ID、操作時刻、エラーメッセージを添えて [サポート](https://support.zilliz.com/hc/en-us) にお問い合わせください。
