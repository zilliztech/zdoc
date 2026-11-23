---
title: "プラットフォーム監査ログ | BYOC"
slug: /view-activities
sidebar_label: "プラットフォーム監査ログ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "プラットフォーム監査ログには、クラスターの作成、再開、削除、組織ユーザーの管理、統合の設定など、Zilliz Cloud リソースおよび組織設定に対する管理操作が記録されます。各ログでは、操作内容、その発生時刻、および操作を実行したユーザーまたはシステムを特定できます。これらの記録を使用して、変更を調査し、管理アクティビティを確認できます。 | BYOC"
type: origin
token: PynkwpI6Qi7zL9kiTBfchREknOc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# プラットフォーム監査ログ

プラットフォーム監査ログには、クラスターの作成、再開、削除、組織ユーザーの管理、統合の設定など、Zilliz Cloud リソースおよび組織設定に対する管理操作が記録されます。各ログでは、操作内容、その発生時刻、および操作を実行したユーザーまたはシステムを特定できます。これらの記録を使用して、変更を調査し、管理アクティビティを確認できます。

このガイドでは、次の方法を説明します。

- 操作を特定し、その操作を実行したユーザーを確認するには、[ログを表示](./view-activities#view-platform-audit-logs) します。

- 監査のために記録を共有したり、コンソール外で分析したりするには、[ログをダウンロード](./view-activities#download-platform-audit-logs) します。

- 継続的なアーカイブと分析のために、独自のストレージまたは受信サービスに[ログを転送](./view-activities#forward-platform-audit-logs) します。

## Platform Audit Logs を表示\{#view-platform-audit-logs}

![C2GJw1dXnhIQ5RbnINocJfAhnhh](https://zdoc-images.s3.us-west-2.amazonaws.com/C2GJw1dXnhIQ5RbnINocJfAhnhh.png)

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、組織を選択して、組織のナビゲーションで **Platform Audit Logs** をクリックします。

1. 次のフィルターを使用して一覧を絞り込みます。デフォルトのフィルターに戻すには、**Reset** をクリックします。

    | フィルター | 使用方法 |
    | --- | --- |
    | All Levels | **Info**、**Warning**、**Error** のいずれかを選択するか、すべてのレベルを維持します。 |
    | All Services | **クラスター**、**User**、**Integration** などのカテゴリを選択します。 |
    | Date range | 開始日と終了日を選択し、**Apply** をクリックします。各クエリの期間は最大 90 × 24 時間です。 |

1. 一致するレコードを確認します。各レコードには次のフィールドが含まれます。

    | フィールド | 説明 |
    | --- | --- |
    | Level | **Info**: 情報イベントです。**Warning**: 注意が必要なイベント（クラスターの削除など）です。**Error**: 報告された失敗です。 |
    | Service | イベントに関連付けられたサービスまたはリソースカテゴリです。 |
    | Message | 操作および影響を受けたリソースです。 |
    | Occurred At | イベントの発生日時です。 |
    | Actor | 操作を実行したユーザーまたはシステムです。 |

</Procedures>

## プラットフォーム監査ログをダウンロードする\{#download-platform-audit-logs}

ログをオフラインで確認したり、他のユーザーと共有したりするには、レコードを CSV または JSON Lines としてダウンロードします。

<Procedures>

1. 組織の **Platform Audit Logs** ページで、必要なレコードのフィルターを選択します。

1. **Download** をクリックし、スプレッドシートで確認する場合は **CSV (.csv)**、プログラムで処理する場合は **JSON (.jsonl)** を選択します。JSON レコードは 1 行につき 1 件です。

</Procedures>

ダウンロードには、ページをまたいで一致するすべてのレコードが含まれ、最大 **100,000 件のレコード**です。結果がこの上限を超える場合は、フィルターを絞り込んでください。

## プラットフォーム監査ログを転送する\{#forward-platform-audit-logs}

管理アクティビティの継続的なコピーを独自のストレージまたはログ処理システムに保持する必要がある場合は、自動転送を有効にします。Zilliz Cloud は、組織全体のログを 1 つの転送先に送信します。転送先は 1 回設定するだけで、新しいログが利用可能になると転送されます。

### 事前準備\{#before-you-start}

- **Organization Owner** であり、転送先の統合を使用する権限を持っていること。統合には、Zilliz Cloud が転送先にログを送信するために必要な接続設定とアクセス設定が保存されます。

- 同じ組織内のプロジェクトに、次のいずれかの統合を準備しておくこと。まだ作成していない場合は、プロジェクトの **Integrations** ページを開き、転送先に応じたガイドに従ってください。

    - **オブジェクトストレージ:** アーカイブまたは後での処理のためにログファイルを保存するには、バケットまたはコンテナを使用します。ログの書き込みに必要なアクセス権を備えた [Amazon S3](./integrate-with-aws-s3)、[Google Cloud Storage](./integrate-with-gcp)、または [Azure Blob Storage](./integrate-with-azure-blob-storage) 統合を作成します。

    - **HTTPS エンドポイント:** 処理システムにログを取り込むための受信サービスを使用します。サービスの HTTPS URL と認証の詳細を準備してから、[HTTPS エンドポイントとの統合](./integrate-with-https-endpoint) に従ってください。統合を作成すると、Zilliz Cloud は既存の受信側サービスに接続されますが、そのサービスが作成されたり、転送が開始されたりするわけではありません。

### 転送の設定\{#configure-forwarding}

次のデモでは、Amazon S3 統合を使用した設定を示します。

<Supademo id="cmw2xvh8s041yqmuzkl534a4d" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で組織の **Platform Audit Logs** ページに移動し、**Auto-forward** カードの **Turn On** をクリックします。

1. **Send To** で、該当するプロジェクトで準備した統合を選択します。転送対象には組織全体のプラットフォーム監査ログが含まれます。プロジェクトの選択やログ一覧のフィルターでは、この範囲は制限されません。

1. オブジェクトストレージの場合は、必要に応じて **Forward Directory**（例: **platform-audit/**.）を入力します。パスはバケットまたはコンテナからの相対パスで、**/** で終わる必要があり、**/**. で始めることはできません。追加のディレクトリが不要な場合は空のままにします。このフィールドは HTTPS エンドポイントには適用されません。

1. 受信システムまたは処理ツールが想定する **Format** を選択します。

    - **JSON**: アーカイブまたはカスタム処理用です。

    - **ECS**: Elastic Common スキーマ のフィールドを想定するパイプライン用です。

    - **OTel**: OpenTelemetry ログ形式を想定するパイプライン用です。

1. 正常に配信されていない保持対象の履歴ログを含めるには、**Also send all undelivered past logs** を選択します。選択しない場合は、新しいログのみが転送されます。ログ一覧の日付フィルターでは、含める履歴は制限されません。

1. 設定を確認し、**Start Forwarding** をクリックします。**Auto-forward** カードに転送先と配信の進行状況が表示されます。

</Procedures>

### ログの到着確認\{#confirm-that-logs-arrive}

<Procedures>

1. **Auto-forward** カードで、**Last delivered**、**Sent today**、**Waiting to send** の配信進行状況を確認します。

1. コンソールで最近のイベントを見つけ、転送先で同じメッセージと発生時刻を確認します。履歴ログを除外した場合は、転送の開始後に発生したイベントを選択します。

    - **オブジェクトストレージ:** 設定したバケットまたはコンテナとディレクトリを開き、配信されたファイルを確認します。

    - **HTTPS エンドポイント:** 受信システムによって保存またはインデックス登録されたレコードを確認します。

1. 処理ツールで、選択した形式のレコードを読み取れることを確認します。

</Procedures>

### 転送の停止\{#stop-forwarding}

組織のログを設定した転送先に送信する必要がなくなったら、転送を停止します。

<Procedures>

1. **Auto-forward** カードで転送先と **Waiting to send** の件数を確認します。停止する前に転送先でレコードが必要な場合は、まず受信を確認してください。

1. 停止する準備ができたら **Turn Off** をクリックします。このボタンは停止リクエストを直ちに送信します。確認ダイアログは表示されません。

1. **Auto-forward** のステータスが **Off** に変わるまで待ちます。リクエストの処理中は、ページに **Stopping forwarding** と表示されます。

</Procedures>

コンソールでは、引き続き利用可能なプラットフォーム監査ログを表示し、ダウンロードできます。

## よくある質問\{#faq}

- **転送先で転送されたログが見つからないのはなぜですか？**

    次の点を確認してください。

    - **イベントと転送先:** 設定した転送先を確認していることを確かめてください。履歴ログを含めなかった場合は、転送の開始後に発生したイベントを確認します。

    - **配信ステータス:** **Auto-forward** カードでエラーまたは送信待ちのログを確認します。報告されたエラーがある場合は、それを手がかりに確認してください。

    - **転送先へのアクセス:** オブジェクトストレージの場合は、設定したディレクトリと統合の書き込み権限を確認します。HTTPS の場合は、受信側の可用性、認証、証明書、および選択した形式の処理を確認します。

- **接続テストに成功した場合、ログが配信されていることを意味しますか？**

    いいえ。転送を有効にした後、転送先で実際のプラットフォーム監査ログを確認してください。接続テストの成功だけでは、受信システムがそのログを保存または処理したことを確認できません。
