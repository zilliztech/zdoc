---
title: "Zilliz Cloud を無料で試す | Cloud"
slug: /free-trials
sidebar_label: "Zilliz Cloud を無料で試す"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、強力な vector database 機能の評価やテスト、および Zilliz Cloud の利用コストの見積もりを支援するために、無料 cluster と無料トライアルの両方を提供しています。開始するには、Zilliz Cloud でアカウントを登録するだけです。支払い情報は不要です。 | Cloud"
type: origin
token: LMfdwRwKIiJtywkwbHVcGnOFnRf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Zilliz Cloud を無料で試す

Zilliz Cloud は、強力な vector database 機能の評価やテスト、および Zilliz Cloud の利用コストの見積もりを支援するために、**無料 cluster** と **無料トライアル** の両方を提供しています。開始するには、Zilliz Cloud で[アカウント登録](./register-with-zilliz-cloud)を行うだけです。支払い情報は不要です。

## 無料 cluster\{#free-cluster}

Zilliz Cloud は、基本的な vector database 機能を無料で利用できる無料 cluster を提供しています。無料 cluster では、以下を利用できます。

- 5 GB のストレージ（1M 個の 768 次元 vector を保存するのに十分です。）

- 月あたり 2.5M vCUs

- 最大 5 つの collections

より多くのリソースが必要な場合、または高度な機能を利用したい場合は、Serverless および Dedicated clusters の[無料トライアル](./free-trials#free-trial)をご利用ください。

## 無料トライアル\{#free-trial}

Zilliz Cloud は、clusters および vector database 機能の無料トライアルを提供しています。以下のセクションでは、clusters 向けのクレジットベース無料トライアルについて説明します。構造化テーブルまたは非構造化データファイルの collections を保持する object store である volume 機能を試したい場合は、[Managed Volumes](./managed-volume) および [External Volumes](./external-volume) を参照してください。

### 無料トライアルを利用する\{#use-free-trial}

勤務先メールアドレスで Zilliz Cloud にサインアップすると、組織の請求アカウントに **&#36;100** の無料クレジットが追加されます。これらのクレジットの有効期限は **30 日間** で、Serverless および Dedicated clusters を試すために使用できます。クレジットを使い切るか有効期限が切れると、無料トライアルは終了します。

トライアル終了後、組織は凍結されます。この期間中、Serverless および Dedicated clusters は[ごみ箱](./use-recycle-bin)に移動され、これらの clusters 専用機能（例：Backup and restore、alerts など）にはアクセスできなくなります。

組織の凍結を解除するには、[Credit Card](./subscribe-by-adding-credit-card) や [Marketplace Subscription](./marketplace-subscription) などの支払い方法を追加するだけです。これにより、ごみ箱から削除済みデータを復元できるようになります。凍結後 30 日以内に支払い方法を追加しない場合、Serverless および Dedicated clusters は完全に削除されますが、組織自体は保持されます。

### クレジットを獲得して有効期限を延長する\{#earn-credits-and-extend-credit-expiration}

勤務先メールアドレスで登録すると、&#36;100 の無料クレジットを受け取れます。さらに、Zilliz Cloud で [Credit Card](./subscribe-by-adding-credit-card) や [Marketplace Subscription](./marketplace-subscription) などの支払い方法を追加すると、追加で &#36;100 のクレジットを獲得できます。さらに、支払い方法を追加すると、クレジットの有効期限が **1 年** に延長されます。

追加のクレジットが必要な場合、またはトライアル期間を延長したい場合は、[営業にお問い合わせ](https://zilliz.com/contact-sales)ください。

### クレジット残高を確認する\{#view-credit-balance}

クレジット残高を確認するには、次の手順に従います。

![FWMbwmjNKh6Qt3btRCyc4KKSnZf](https://zdoc-images.s3.us-west-2.amazonaws.com/FWMbwmjNKh6Qt3btRCyc4KKSnZf.png)

<Procedures>

1. Zilliz Cloud で自分の組織に移動します。

1. **Billing** に進みます。

1. **Credits** セクションで残高を確認します。

</Procedures>

## クレジットアラートを監視する\{#monitor-credit-alerts}

<Admonition type="info" icon="📘" title="注意">

クレジットの意図しない消費を避けるため、使用していない clusters は手動で停止することを推奨します。

</Admonition>

### 無料トライアル通知\{#free-trial-notifications}

無料トライアル期間中、Zilliz Cloud からトライアルの状況に関する複数のメール通知が送信されます。これらのメールは Organization Owners に送信され、以下のイベントを契機に発生します。

- 付与後最初の 3 日間でクレジットが消費されなかった場合。

- クレジットの 60% が消費された場合。

- クレジットの有効期限が 3 日未満に迫っている場合。

- 有効な支払い方法がないままトライアルの期限切れにより組織が凍結された場合。

- トライアル終了が近づき、Serverless および Dedicated clusters の削除が予定されている場合。

- トライアル終了後、Serverless および Dedicated clusters がごみ箱に移動された場合。

- すべてのクレジットを使い切った場合。

## 関連トピック\{#related-topics}

- [Zilliz Cloud に登録する](./register-with-zilliz-cloud)

- [Cluster を作成する](./create-cluster)

