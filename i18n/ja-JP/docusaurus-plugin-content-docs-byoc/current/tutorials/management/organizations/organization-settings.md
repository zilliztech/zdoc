---
title: "組織設定を管理する | BYOC"
slug: /organization-settings
sidebar_label: "組織設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Organization Owner の場合、組織設定を管理する権限があります。 | BYOC"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織設定を管理する

Organization Owner の場合、組織設定を管理する権限があります。

このガイドでは、組織設定を管理する手順を説明します。

## 組織を表示する\{#view-organizations}

Zilliz Cloud にサインアップすると、デフォルトの組織が 1 つ作成されます。新しい組織を作成することはできませんが、招待によって他のユーザーの組織に参加することはできます。 

[Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインすると、自分が所属している組織の一覧ページが表示されます。そこで、これらの組織を確認して入ることができます。

参加しているすべての組織をすばやく確認するには、左上隅の **All Organizations** をクリックしてください。

![view-organizations](https://zdoc-images.s3.us-west-2.amazonaws.com/view-organizations.png "view-organizations")

## 組織を作成する\{#create-an-organization}

複数の組織が必要な場合は、[サポートチケットを送信](http://support.zilliz.com)して、マルチ組織機能を有効化できるよう依頼してください。この機能が有効になると、自分で新しい組織を作成できるようになります。

![SJ2xw2rO4h2LJTblDpmcgHh0nHg](https://zdoc-images.s3.us-west-2.amazonaws.com/SJ2xw2rO4h2LJTblDpmcgHh0nHg.png)

## 組織名を変更する\{#rename-an-organization}

組織名を変更するには、[Organization Owner](./organization-users) である必要があります。

![edit-organization-name-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-organization-name-byoc.png "edit-organization-name-byoc")

## タイムゾーンを管理する\{#manage-timezone}

システムのタイムゾーンは、初回ログインを行った場所に基づいて設定され、Zilliz Cloud に表示されるすべての時刻文字列に適用されます。

現在のタイムゾーンを表示するには、Organization Owner または Organization Member のいずれでもかまいません。組織内のロールの詳細については、[組織ユーザーを管理する](./organization-users) を参照してください。

![byoc-timezone-settings](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-timezone-settings.png "byoc-timezone-settings")

システムのタイムゾーンを変更するには、[Organization Owner](./organization-users) である必要があります。**Edit** をクリックして **Time Zone Settings** ダイアログボックスを開き、ドロップダウンリストからタイムゾーンを選択します。タイムゾーン名を入力して、目的のタイムゾーンをすばやく絞り込むこともできます。

## 優先メンテナンスウィンドウを設定する\{#set-up-preferred-maintenance-window}

優先メンテナンスウィンドウとは、Zilliz Cloud が Dedicated クラスターの Milvus バージョンのアップグレードなど、スケジュールされたメンテナンスを自動的に実行する **4 時間** の時間帯です。

優先ウィンドウを設定すると、ピークトラフィック時間外にメンテナンスを予定し、ワークロードへの影響を最小限に抑えることができます。

デフォルトでは、このウィンドウは **2:00 AM–6:00 AM** に設定されています。必要に応じて更新できます。

以下のデモでは、優先メンテナンスウィンドウの編集方法を示しています。

<Supademo id="cmn4bhv4l0ps5z3qmdcrmuij7" title=""  />

<Admonition type="info" icon="📘" title="注">

メンテナンスが優先ウィンドウを超えて実行された場合、完了するまで継続されます。

</Admonition>

予定されたメンテナンスの 7 日前になると、Web コンソールの **Cluster Overview** ページに通知が表示されます。

![Czaab7qPaoElX6xVizQcEiwznmh](https://zdoc-images.s3.us-west-2.amazonaws.com/czaab7qpaoelx6xvizqceiwznmh.png "Czaab7qPaoElX6xVizQcEiwznmh")

- **Organization Owners** と **Project Admins** の場合、次のいずれかを選択できます。

    - クラスターを最新の Milvus バージョンにすぐアップグレードする。

    - メンテナンスを 7 日間延期する。延期できるのは 1 回のみです。

    - 何もせず、予定どおりにメンテナンスを実行させる。

- **Organization Members** の場合は、[SDK の互換性](./install-sdks)を確認してください。

## 組織を削除する\{#delete-organization}

開始する前に、以下の条件が満たされていることを確認してください。

- 現在の組織内のすべてのクラスターが[削除](./manage-cluster)されていること。

- 対象の組織で [Organization Owner](./organization-users) ロールが付与されていること。

- 残っている前払い資金はすべて返金されている必要があります。

組織を削除するには、次の手順に従います。 

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. 削除したい組織に入ります。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **System Settings** ページで **Delete Organization** のエリアを見つけ、ボタンをクリックします。

1. ポップアップウィンドウの指示に従い、ボタンをクリックして組織の削除を完了します。

</Procedures>

<Admonition type="danger" icon="🚧" title="🚧 警告">

組織を削除する操作は元に戻せません。この操作を行う際は十分に注意してください。

</Admonition>

![byoc-delete-organization](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-delete-organization.png "byoc-delete-organization")

