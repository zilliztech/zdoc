---
title: "Zilliz Cloud を無料で試す | Cloud"
slug: /free-trials
sidebar_label: "Zilliz Cloud を無料で試す"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、強力なベクトルデータベース機能の評価やテスト、および Zilliz Cloud の利用コストの見積もりに役立つよう、無料クラスターと無料トライアルの両方を提供しています。開始するには、Zilliz Cloud でアカウントを登録するだけです。支払い情報は不要です。 | Cloud"
type: origin
token: LMfdwRwKIiJtywkwbHVcGnOFnRf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Zilliz Cloud を無料で試す

Zilliz Cloud は、強力なベクトルデータベース機能の評価やテスト、および Zilliz Cloud の利用コストの見積もりに役立つよう、**無料クラスター** と **無料トライアル** の両方を提供しています。開始するには、Zilliz Cloud で [アカウントを登録](./register-with-zilliz-cloud) するだけです。支払い情報は不要です。

## 無料クラスター\{#free-cluster}

Zilliz Cloud は、基本的なベクトルデータベース機能を無料で利用できる無料クラスターを提供しています。無料クラスターでは、以下を利用できます。

- 5 GB のストレージ（1M 768 次元ベクトルを保存するのに十分です。）

- 月あたり 2.5M vCUs

- 最大 5 コレクション

より多くのリソースが必要な場合、または高度な機能にアクセスしたい場合は、Serverless および Dedicated クラスターの [無料トライアル](./free-trials#free-trial) をご利用ください。

## 無料トライアル\{#free-trial}

Zilliz Cloud は、クラスターとベクトルデータベース機能向けに無料トライアルを提供しています。以下のセクションでは、クラスター向けのクレジットベースの無料トライアルを紹介します。構造化テーブルまたは非構造化データファイルのコレクションを保持するオブジェクトストアであるボリューム機能を試したい場合は、[Managed Volumes](./managed-volume) および [External Volumes](./external-volume) を参照してください。

### 無料トライアルを利用する\{#use-free-trial}

仕事用メールアドレスで Zilliz Cloud に登録すると、所属する組織の請求アカウントに **&#36;100** 分の無料クレジットが追加されます。このクレジットの有効期限は **30 日間** で、Serverless および Dedicated クラスターを試すために使用できます。クレジットを使い切るか、有効期限が切れると、無料トライアルは終了します。

トライアル後、組織は凍結されます。この期間中、Serverless および Dedicated クラスターは [ごみ箱](./use-recycle-bin) に移動され、これらのクラスター専用の機能（例：バックアップと復元、アラートなど）にはアクセスできなくなります。

組織の凍結を解除するには、[Credit Card](./subscribe-by-adding-credit-card) や [Marketplace Subscription](./marketplace-subscription) などの支払い方法を追加するだけです。これにより、ごみ箱から削除済みデータを復元できるようになります。凍結後 30 日以内に支払い方法を追加しない場合、Serverless および Dedicated クラスターは完全に削除されますが、組織自体は保持されます。

### クレジットを獲得し、クレジットの有効期限を延長する\{#earn-credits-and-extend-credit-expiration}

仕事用メールアドレスで登録すると、&#36;100 分の無料クレジットを受け取れます。さらに、Zilliz Cloud で [Credit Card](./subscribe-by-adding-credit-card) または [Marketplace Subscription](./marketplace-subscription) などの支払い方法を追加すると、追加で &#36;100 を獲得できます。加えて、支払い方法を追加すると、クレジットの有効期限が **1 年** に延長されます。

追加のクレジットが必要な場合、またはトライアル期間を延長したい場合は、[営業にお問い合わせください](https://zilliz.com/contact-sales)。

### クレジット残高を表示する\{#view-credit-balance}

クレジット残高を表示するには、次の手順を実行します。

![FWMbwmjNKh6Qt3btRCyc4KKSnZf](https://zdoc-images.s3.us-west-2.amazonaws.com/FWMbwmjNKh6Qt3btRCyc4KKSnZf.png)

<Procedures>

1. Zilliz Cloud で組織に移動します。

1. **Billing** に移動します。

1. **Credits** セクションで残高を確認します。

</Procedures>

## クレジットアラートを監視する\{#monitor-credit-alerts}

<Admonition type="info" icon="📘" title="注意">

意図しないクレジット消費を避けるため、使用していないクラスターは手動で一時停止することを推奨します。

</Admonition>

### 無料トライアルの通知\{#free-trial-notifications}

無料トライアル中、ステータスに関して Zilliz Cloud から複数のメール通知を受け取ります。これらのメールは Organization Owners に送信され、以下のイベントによってトリガーされます。

- 付与後最初の 3 日以内にクレジットが消費されない。

- クレジットの 60% が消費される。

- クレジットの有効期限が 3 日未満になる。

- 有効な支払い方法がないままトライアルが終了し、組織が凍結される。

- トライアルの終了が近づき、Serverless および Dedicated クラスターの削除が予定されている。

- トライアル終了後、Serverless および Dedicated クラスターがごみ箱に移動される。

- すべてのクレジットを使い切る。

## 関連トピック\{#related-topics}

- [Zilliz Cloud に登録する](./register-with-zilliz-cloud)

- [クラスターを作成する](./create-cluster)

