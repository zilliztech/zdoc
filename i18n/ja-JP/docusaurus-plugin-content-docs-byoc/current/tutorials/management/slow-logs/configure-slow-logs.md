---
title: "Slow Logs を設定する | BYOC"
slug: /configure-slow-logs
sidebar_label: "Slow Logs を設定する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "予想以上に時間がかかる Search、HybridSearch、Query リクエストを調査するには、スローログを使用します。実行時間のしきい値を設定し、しきい値を超えるリクエストをオブジェクトストレージまたは HTTPS サービスに転送して分析します。 | BYOC"
type: origin
token: QoEpwKGbEirQl1kh3W3c0zdinAd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Slow Logs を設定する

予想以上に時間がかかる Search、HybridSearch、Query リクエストを調査するには、スローログを使用します。実行時間のしきい値を設定し、しきい値を超えるリクエストをオブジェクトストレージまたは HTTPS サービスに転送して分析します。

## 始める前に\{#before-you-start}

- Enterprise プラン以上で稼働中の Dedicated クラスターを使用すること。

- クラスターへのアクセス権を持つ **Organization Owner**、**Project Admin**、または **クラスター Admin** としてサインインすること。

- **クラスターと同じプロジェクト**で送信先の統合を準備すること：

    - **バケットまたはコンテナにログを保存する場合：** クラスターのリージョン用に、[Amazon S3](./integrate-with-aws-s3)、[Google Cloud Storage](./integrate-with-gcp)、または [Azure Blob Storage](./integrate-with-azure-blob-storage) の統合を設定すること。

    - **ログをログ管理システムに送信する場合：** HTTPS 経由でログを受信するサービスを用意し、その URL と認証設定を指定して [HTTPS エンドポイント統合](./integrate-with-https-endpoint) を構成すること。

スローログは、監査ログやアクセスログとは独立して設定されます。スローログを設定するために、いずれも無効にする必要はありません。統合を作成すると送信先が準備されます。以下の手順では、クラスターからの転送を有効にします。

## スローログ転送を有効にする\{#enable-slow-log-forwarding}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) でプロジェクトを開き、対象のクラスターを選択します。

1. **Logs** タブを開きます。**Slow Logs** カードで **Configure** をクリックします。

1. **Slow Logs Settings** でログの送信先を選択します：

    - **Send To:** このプロジェクトで準備した統合を選択します。

    - **Format:** 受信側システムで処理できる形式（**JSON**、**ECS**、**OTel**（OpenTelemetry））を選択します。

    - **オブジェクトストレージの場合:** 送信先ディレクトリを指定し、パスのプレビューを確認します。HTTPS の送信先ではディレクトリを使用しません。

1. **Slow Log Threshold (ms)** に、リクエストを調査する実行時間のしきい値を設定します。デフォルトは **150 ms** です。たとえば、しきい値が 150 ms の場合、200 ms かかるリクエストはスローログの記録対象になります。しきい値を低くするとより多くのリクエストが記録され、高くすると実行時間の長いリクエストに絞り込まれます。

1. 送信先としきい値を確認し、**Start Forwarding** をクリックします。**Slow Logs** カードでステータスを確認し、該当するログが送信先に届くことを確認します。

</Procedures>

## ログが届くことを確認する\{#verify-that-logs-arrive}

<Procedures>

1. 転送が有効になったら、実行時間が設定したしきい値を超える **Search**、**HybridSearch**、または **Query** リクエストを特定します。操作時刻と対象のコレクションを記録します。しきい値を下回るリクエストではスローログは生成されません。

1. 送信先で該当するレコードを検索します：

    - **オブジェクトストレージ:** 設定したバケットまたはコンテナとディレクトリを開き、新しく配信されたログオブジェクトを確認します。

    - **HTTPS エンドポイント:** 受信サービスの取り込み記録または保存済みログを確認します。

1. 記録した操作と実行時間を、調査対象のリクエストと比較します。フィールドの定義については、[Slow Logs Reference](./slow-log-reference) を参照してください。

</Procedures>

統合テストが成功しても、実際のスローログの配信は検証されません。しきい値を超えるリクエストがない場合、スローログが存在しないことだけでは、転送の失敗を示すものではありません。

## よくある質問\{#faq}

- **Configure を使用できないのはなぜですか？**

    クラスターが稼働中であり、使用しているロール、プラン、クラスタータイプがスローログをサポートしていることを確認してください。スローログは監査ログおよびアクセスログとは別に設定します。

- **送信先の統合が見つからないのはなぜですか？**

    統合は、クラスターと同じプロジェクトに属している必要があります。プロジェクトの **Integrations** ページを確認し、必要に応じてそこから統合を作成してください。

- **スローログが届かないのはなぜですか？**

    コンソールで転送ステータスとエラーの有無を確認してから、リクエストと送信先を確認してください：

    - リクエストが転送開始後に発生し、サポート対象の操作であり、設定したしきい値を超えていることを確認してください。

    - オブジェクトストレージの場合は、書き込み権限を確認し、設定したディレクトリを確認してください。

    - HTTPS の場合は、受信側の可用性、認証設定、取り込みエラーを確認してください。
