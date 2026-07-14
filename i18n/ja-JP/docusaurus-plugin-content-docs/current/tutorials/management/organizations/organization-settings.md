---
title: "組織設定の管理 | Cloud"
slug: /organization-settings
sidebar_label: "Organization Settings"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Organization Owner であれば、組織設定を管理する権限があります。 | Cloud"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織設定の管理

Organization Owner であれば、組織設定を管理する権限があります。

このガイドでは、組織設定を管理する手順を説明します。

## 組織の表示\{#view-organizations}

Zilliz Cloud にサインアップすると、デフォルトの組織が 1 つ作成されます。新しい組織を作成することはできませんが、招待によって他のユーザーの組織に参加することはできます。 

[Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインすると、自分が参加している組織の一覧ページが表示されます。そこからこれらの組織を確認し、開くことができます。

参加しているすべての組織をすばやく確認するには、左上隅の **All Organizations** をクリックしてください。

![view-organizations](https://zdoc-images.s3.us-west-2.amazonaws.com/view-organizations.png "view-organizations")

## 組織の作成\{#create-an-organization}

複数の組織が必要な場合は、[サポートチケットを送信](http://support.zilliz.com)して、マルチ組織機能を有効化できるようにしてください。機能が有効になると、自分で新しい組織を作成できるようになります。

![SJ2xw2rO4h2LJTblDpmcgHh0nHg](https://zdoc-images.s3.us-west-2.amazonaws.com/SJ2xw2rO4h2LJTblDpmcgHh0nHg.png)

## 組織名の変更\{#rename-an-organization}

組織名を変更するには、[Organization Owner](./organization-users) である必要があります。

組織名は、次のいずれかの方法で変更できます。

- 組織一覧ページで組織名を変更する:

    ![rename-organization](https://zdoc-images.s3.us-west-2.amazonaws.com/rename-organization.png "rename-organization")

- 組織にアクセスし、**System Settings** ページで組織名を変更する:

    ![edit-organization-name](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-organization-name.png "edit-organization-name")

## タイムゾーンの管理\{#manage-timezone}

システムのタイムゾーンは、最初にログインした場所に基づいて設定され、Zilliz Cloud に表示されるすべての時刻文字列に適用されます。

現在のタイムゾーンを表示するには、Organization Owner または Organization Member のいずれでもかまいません。組織内のロールの詳細については、[組織ユーザーの管理](./organization-users)を参照してください。

![timezone-settings](https://zdoc-images.s3.us-west-2.amazonaws.com/timezone-settings.png "timezone-settings")

システムのタイムゾーンを変更するには、[Organization Owner](./organization-users) である必要があります。**Edit** をクリックして **Time Zone Settings** ダイアログボックスを開き、ドロップダウンリストからタイムゾーンを選択します。タイムゾーン名を入力して、目的のタイムゾーンをすばやく絞り込むこともできます。

## 優先メンテナンス時間帯の設定\{#set-up-preferred-maintenance-window}

優先メンテナンス時間帯とは、Zilliz Cloud が自動的にスケジュール済みメンテナンスを実行する **4 時間** の期間です。たとえば、Dedicated クラスターの Milvus バージョンのアップグレードなどが含まれます。

優先時間帯を設定すると、トラフィックのピーク時間外にメンテナンスを予定し、ワークロードへの影響を最小限に抑えることができます。

デフォルトでは、この時間帯は **午前 2:00～午前 6:00** に設定されています。必要に応じて更新できます。

次のデモでは、優先メンテナンス時間帯の編集方法を示します。

<Supademo id="cmn4bhv4l0ps5z3qmdcrmuij7" title=""  />

<Admonition type="info" icon="📘" title="注">

メンテナンスが優先時間帯を過ぎても継続する場合は、完了するまで実行されます。

</Admonition>

スケジュール済みメンテナンスの 7 日前になると、Web コンソールの **Cluster Overview** ページに通知が表示されます。

![Czaab7qPaoElX6xVizQcEiwznmh](https://zdoc-images.s3.us-west-2.amazonaws.com/czaab7qpaoelx6xvizqceiwznmh.png "Czaab7qPaoElX6xVizQcEiwznmh")

- **Organization Owners** と **Project Admins** は、次のいずれかを選択できます。

    - クラスターを最新の Milvus バージョンに直ちにアップグレードする。

    - メンテナンスを 7 日間延期する。延期できるのは 1 回のみです。

    - 何もせず、スケジュールどおりにメンテナンスを実行させる。

- **Organization Members** は、[SDK の互換性](./install-sdks)を確認してください。

## 組織の削除\{#delete-organization}

開始する前に、次の条件を満たしていることを確認してください。

- 現在の組織内のすべてのクラスターが[削除](./manage-cluster)されていること。

- 現在の組織内のすべてのボリュームが[削除](./managed-volume)されていること。

- 現在の組織のすべての[請求](./payment-billing)が支払済みであること。

- 対象の組織で [Organization Owner](./organization-users) ロールが付与されていること。

- 残っている前払い資金はすべて返金する必要があります。

- [AWS Marketplace](./subscribe-on-aws-marketplace)、[GCP Marketplace](./subscribe-on-gcp-marketplace)、または [Azure Marketplace](./subscribe-on-azure-marketplace) などのサードパーティ Marketplace サブスクリプションはキャンセルする必要があります。

組織を削除するには: 

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. 削除したい組織にアクセスします。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **System Settings** ページで、**Delete Organization** 領域を見つけてボタンをクリックします。

1. ポップアップウィンドウの指示に従い、ボタンをクリックして組織の削除を完了します。

</Procedures>

<Admonition type="danger" icon="🚧" title="🚧 警告">

組織を削除する操作は元に戻せません。この操作は特に注意して行ってください。

</Admonition>

![delete-organization-en](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-organization-en.png "delete-organization-en")

