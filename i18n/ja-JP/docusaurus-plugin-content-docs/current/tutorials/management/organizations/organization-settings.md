---
title: "組織設定の管理 | Cloud"
slug: /organization-settings
sidebar_label: "組織設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Organization Owner である場合、組織設定を管理する権限があります。 | Cloud"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織設定の管理

Organization Owner である場合、組織設定を管理する権限があります。

このガイドでは、組織設定を管理する手順について説明します。

## 組織を表示する\{#view-organizations}

Zilliz Cloud にサインアップすると、デフォルトの組織が作成されます。新しい組織は作成できませんが、招待を受けることで他のユーザーの組織に参加できます。

[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインすると、所属している組織の一覧ページが表示されます。これらの組織を確認してアクセスできます。

参加しているすべての組織をすばやく確認するには、左上隅にある **All Organizations** をクリックします。

![view-organizations](https://zdoc-images.s3.us-west-2.amazonaws.com/view-organizations.png "view-organizations")

## 組織を作成する\{#create-an-organization}

複数の組織が必要な場合は、マルチ組織機能を有効化いたしますので、[サポートチケットを送信](http://support.zilliz.com)してください。機能が有効になると、ご自身で新しい組織を作成できるようになります。

![SJ2xw2rO4h2LJTblDpmcgHh0nHg](https://zdoc-images.s3.us-west-2.amazonaws.com/SJ2xw2rO4h2LJTblDpmcgHh0nHg.png)

## 組織名を変更する\{#rename-an-organization}

組織名を変更するには、[Organization Owner](./manage-platform-roles#predefined-organization-roles) である必要があります。

組織名は、以下のいずれかの方法で変更できます。

- 組織一覧ページで組織名を変更する:

    ![rename-organization](https://zdoc-images.s3.us-west-2.amazonaws.com/rename-organization.png "rename-organization")

- 組織に入り、**System Settings** ページで名前を変更する:

    ![edit-organization-name](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-organization-name.png "edit-organization-name")

## タイムゾーンを管理する\{#manage-timezone}

システムのタイムゾーンは、最初にログインした場所に設定され、Zilliz Cloud に表示されるすべての時刻文字列に適用されます。

現在のタイムゾーンを確認するには、Organization Owner または Organization Member である必要があります。組織内のロールの詳細については、[プラットフォームロールの管理](./manage-platform-roles) を参照してください。

![timezone-settings](https://zdoc-images.s3.us-west-2.amazonaws.com/timezone-settings.png "timezone-settings")

システムのタイムゾーンを変更するには、[Organization Owner](./manage-platform-roles#predefined-organization-roles) である必要があります。**Edit** をクリックして **Time Zone Settings** ダイアログボックスを開き、ドロップダウンリストからタイムゾーンを選択します。タイムゾーン名を入力して、目的のタイムゾーンをすばやく絞り込むこともできます。

## 優先メンテナンス時間枠を設定する\{#set-up-preferred-maintenance-window}

優先メンテナンス時間枠とは、Zilliz Cloud がスケジュールされたメンテナンス（Dedicated クラスターの Milvus バージョンのアップグレードなど）を自動的に実行する **4 時間** の期間です。

優先時間枠を設定すると、トラフィックのピーク時間帯を避けてメンテナンスをスケジュールでき、ワークロードへの影響を最小限に抑えられます。

デフォルトでは、この時間枠は **2:00 AM–6:00 AM** に設定されています。必要に応じて変更できます。

以下のデモでは、優先メンテナンス時間枠を編集する方法を示します。

<Supademo id="cmn4bhv4l0ps5z3qmdcrmuij7" title=""  />

<Admonition type="info" title="Note">

メンテナンスが優先時間枠を超えて実行された場合、完了するまで継続されます。

</Admonition>

スケジュールされたメンテナンスの 7 日前に、Web コンソールの **クラスター概要** ページに通知が表示されます。

![Czaab7qPaoElX6xVizQcEiwznmh](https://zdoc-images.s3.us-west-2.amazonaws.com/czaab7qpaoelx6xvizqceiwznmh.png "Czaab7qPaoElX6xVizQcEiwznmh")

- **Organization Owners** および **Project Admins** の場合は、以下のいずれかを選択できます。

    - クラスターを最新の Milvus バージョンに直ちにアップグレードする。

    - メンテナンスを 7 日間延期する。延期できるのは 1 回のみです。

    - 何もしないで、メンテナンスをスケジュールどおりに実行させる。

- **Organization Members** の場合は、[SDK の互換性](./install-sdks#sdk-compatibility) を確認してください。

## 組織を削除する\{#delete-organization}

開始する前に、以下の条件を満たしていることを確認してください。

- 現在の組織内のすべてのクラスターが[削除](./manage-cluster)されていること。

- 現在の組織内のすべてのボリュームが[削除](./managed-volume)されていること。

- 組織のすべての[請求](./payment-billing)が支払われていること。

- 対象の組織で [Organization Owner](./manage-platform-roles#predefined-organization-roles) ロールが付与されていること。

- 残りの前払い資金がすべて返金されていること。

- [AWS Marketplace](./subscribe-on-aws-marketplace)、[GCP Marketplace](./subscribe-on-gcp-marketplace)、[Azure Marketplace](./subscribe-on-azure-marketplace) などのサードパーティマーケットプレイスのサブスクリプションがキャンセルされていること。

組織を削除するには、以下の手順を実行します。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 削除する組織に入ります。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **System Settings** ページで **Delete Organization** エリアを見つけてボタンをクリックします。

1. ポップアップウィンドウの指示に従ってボタンをクリックし、組織の削除を完了します。

</Procedures>

<Admonition type="danger" title="Danger">

組織の削除操作は元に戻せません。この操作を行う際は十分にご注意ください。

</Admonition>

![delete-organization-en](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-organization-en.png "delete-organization-en")
