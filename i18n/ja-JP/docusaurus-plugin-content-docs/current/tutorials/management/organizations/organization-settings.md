---
title: "組織設定を管理する | Cloud"
slug: /organization-settings
sidebar_label: "組織設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Organization Owner の場合、組織設定を管理する権限があります。 | Cloud"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織設定を管理する

Organization Owner の場合、組織設定を管理する権限があります。

このガイドでは、組織設定を管理する手順を説明します。

## 組織を表示する\{#view-organizations}

Zilliz Cloud にサインアップすると、デフォルトの組織が自動的に作成されます。新しい組織を作成することはできませんが、招待を受けることで他のユーザーの組織に参加できます。 

[Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインすると、自分が所属している組織の一覧ページが表示されます。そこで各組織を確認し、アクセスできます。

参加しているすべての組織をすばやく確認するには、左上隅にある **All Organizations** をクリックするだけです。

![view-organizations](https://zdoc-images.s3.us-west-2.amazonaws.com/view-organizations.png "view-organizations")

## 組織を作成する\{#create-an-organization}

複数の組織が必要な場合は、[サポートチケットを送信](http://support.zilliz.com)して、マルチ組織機能を有効化してもらってください。機能が有効になると、自分で新しい組織を作成できるようになります。

![SJ2xw2rO4h2LJTblDpmcgHh0nHg](https://zdoc-images.s3.us-west-2.amazonaws.com/SJ2xw2rO4h2LJTblDpmcgHh0nHg.png)

## 組織名を変更する\{#rename-an-organization}

組織名を変更するには、[Organization Owner](./organization-users) である必要があります。

組織名は、次のいずれかの方法で変更できます。

- 組織一覧ページで組織名を変更する:

    ![rename-organization](https://zdoc-images.s3.us-west-2.amazonaws.com/rename-organization.png "rename-organization")

- 組織にアクセスし、**System Settings** ページで組織名を変更する:

    ![edit-organization-name](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-organization-name.png "edit-organization-name")

## タイムゾーンを管理する\{#manage-timezone}

システムのタイムゾーンは、最初にログインした場所に基づいて設定され、Zilliz Cloud に表示されるすべての時刻文字列に適用されます。

現在のタイムゾーンを表示するには、Organization Owner または Organization Member のいずれかである必要があります。組織内のロールの詳細については、[組織ユーザーを管理する](./organization-users) を参照してください。

![timezone-settings](https://zdoc-images.s3.us-west-2.amazonaws.com/timezone-settings.png "timezone-settings")

システムのタイムゾーンを変更するには、[Organization Owner](./organization-users) である必要があります。**Edit** をクリックして **Time Zone Settings** ダイアログボックスを開き、ドロップダウンリストからタイムゾーンを選択します。タイムゾーン名を入力して、目的のタイムゾーンをすばやく絞り込むこともできます。

## 優先メンテナンスウィンドウを設定する\{#set-up-preferred-maintenance-window}

優先メンテナンスウィンドウとは、Zilliz Cloud が Dedicated クラスターの Milvus バージョンのアップグレードなど、定期メンテナンスを自動的に実行する **4 時間** の時間帯です。

優先ウィンドウを設定することで、トラフィックのピーク時間外にメンテナンスをスケジュールし、ワークロードへの影響を最小限に抑えることができます。

デフォルトでは、ウィンドウは **午前 2:00～午前 6:00** に設定されています。必要に応じて更新できます。

次のデモは、優先メンテナンスウィンドウを編集する方法を示しています。

<Supademo id="cmn4bhv4l0ps5z3qmdcrmuij7" title=""  />

<Admonition type="info" icon="📘" title="注">

メンテナンスが優先ウィンドウを超えて実行された場合、完了するまで継続されます。

</Admonition>

予定されたメンテナンスの 7 日前になると、Web コンソールの **Cluster Overview** ページに通知が表示されます。

![Czaab7qPaoElX6xVizQcEiwznmh](https://zdoc-images.s3.us-west-2.amazonaws.com/czaab7qpaoelx6xvizqceiwznmh.png "Czaab7qPaoElX6xVizQcEiwznmh")

- **Organization Owners** と **Project Admins** は、次のいずれかを選択できます。

    - クラスターを最新の Milvus バージョンに直ちにアップグレードする。

    - メンテナンスを 7 日間延期する。延期できるのは 1 回のみです。

    - 何もせず、予定どおりにメンテナンスを実行させる。

- **Organization Members** は、[SDK compatibility](./install-sdks#sdk-compatibility) を確認してください。

## 組織を削除する\{#delete-organization}

始める前に、次の条件を満たしていることを確認してください。

- 現在の組織内のすべてのクラスターが[削除](./manage-cluster)されている。

- 現在の組織内のすべてのボリュームが[削除](./managed-volume)されている。

- 組織のすべての[請求](./payment-billing)が支払済みである。

- 対象の組織で [Organization Owner](./organization-users) ロールが付与されている。

- 残っている前払い資金はすべて返金する必要がある。

- [AWS Marketplace](./subscribe-on-aws-marketplace)、[GCP Marketplace](./subscribe-on-gcp-marketplace)、または [Azure Marketplace](./subscribe-on-azure-marketplace) などのサードパーティー Marketplace のサブスクリプションをキャンセルする必要がある。

組織を削除するには: 

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. 削除する組織にアクセスします。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **System Settings** ページで **Delete Organization** 領域を見つけて、ボタンをクリックします。

1. ポップアップウィンドウの指示に従い、ボタンをクリックして組織の削除を完了します。

</Procedures>

<Admonition type="danger" icon="🚧" title="🚧 警告">

組織を削除する操作は元に戻せません。この操作は十分注意して行ってください。

</Admonition>

![delete-organization-en](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-organization-en.png "delete-organization-en")

