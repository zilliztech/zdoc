---
title: "組織設定の管理 | BYOC"
slug: /organization-settings
sidebar_key: organization-settings
sidebar_label: "組織設定"
beta: FALSE
notebook: FALSE
description: "組織オーナーの場合、組織設定を管理する権限があります。 | BYOC"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 組織
  - 設定

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織設定の管理

組織オーナーの場合、組織設定を管理する権限があります。

このガイドでは、組織設定を管理する手順について説明します。

## 組織の表示\{#view-organizations}

Zilliz Cloud にサインアップすると、デフォルトの組織が自動的に作成されます。複数の組織が必要な場合は、マルチ組織機能を有効にできるよう[サポートチケットを送信](http://support.zilliz.com)してください。機能が有効になると、自分で新しい組織を作成できます。

[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインすると、自分が所属する組織の一覧が表示されるページに移動します。これらの組織を確認して、組織に入ることができます。

参加しているすべての組織をすばやく表示するには、左上隅の **All 組織** をクリックするだけです。

![view-organizations](https://zdoc-images.s3.us-west-2.amazonaws.com/view-organizations.png "view-organizations")

## 組織の作成\{#create-an-organization}

複数の組織が必要な場合は、マルチ組織機能を有効にできるよう[サポートチケットを送信](http://support.zilliz.com)してください。機能が有効になると、自分で新しい組織を作成できます。

![SJ2xw2rO4h2LJTblDpmcgHh0nHg](https://zdoc-images.s3.us-west-2.amazonaws.com/SJ2xw2rO4h2LJTblDpmcgHh0nHg.png)

## 組織名の変更\{#rename-an-organization}

組織名を変更するには、[組織オーナー](./organization-users) である必要があります。

![edit-organization-name-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-organization-name-byoc.png "edit-organization-name-byoc")

## タイムゾーンの管理\{#manage-timezone}

システムのタイムゾーンは、初回ログイン時の場所に設定され、Zilliz Cloud に表示されるすべての時刻文字列に適用されます。

現在のタイムゾーンを表示するには、組織オーナー または 組織メンバー のいずれかである必要があります。組織内のロールの詳細については、[Manage Organization Users](./organization-users) を参照してください。

![byoc-timezone-settings](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-timezone-settings.png "byoc-timezone-settings")

システムのタイムゾーンを変更するには、[組織オーナー](./organization-users) である必要があります。**Edit** をクリックして **タイムゾーン設定** ダイアログボックスを開き、ドロップダウンリストからタイムゾーンを選択します。タイムゾーンの名前を入力して、目的のタイムゾーンをすばやく絞り込むこともできます。

## 優先メンテナンスウィンドウの設定\{#set-up-preferred-maintenance-window}

優先メンテナンスウィンドウは、Zilliz Cloud が自動的にスケジュールされたメンテナンス（Dedicated クラスターの Milvus バージョンのアップグレードなど）を実行する **4 時間** の期間です。

優先ウィンドウを設定することで、ピーク時のトラフィック時間帯を避けてメンテナンスをスケジュールし、ワークロードへの影響を最小限に抑えることができます。

デフォルトでは、ウィンドウは **午前 2:00～午前 6:00** に設定されています。必要に応じて更新できます。

以下のデモでは、優先メンテナンスウィンドウの編集方法を示しています。

<Supademo id="cmn4bhv4l0ps5z3qmdcrmuij7" title=""  />

<Admonition type="info" icon="📘" title="Note">

<p>メンテナンスが優先ウィンドウを過ぎても実行される場合は、完了するまで継続されます。</p>

</Admonition>

スケジュールされたメンテナンスの 7 日前に、Web コンソールの **クラスター概要** ページに通知が表示されます。

![Czaab7qPaoElX6xVizQcEiwznmh](https://zdoc-images.s3.us-west-2.amazonaws.com/czaab7qpaoelx6xvizqceiwznmh.png "Czaab7qPaoElX6xVizQcEiwznmh")

- **組織オーナーs** および **プロジェクト管理者s** の場合、以下の選択肢があります:

    - クラスターを最新の Milvus バージョンにすぐにアップグレードする。

    - メンテナンスを 7 日間延期する。延期は 1 回のみ可能です。

    - 何もせず、スケジュールされた通りにメンテナンスを実行させる。

- **組織メンバーs** の場合は、[SDK compatibility](./install-sdks#sdk-compatibility) を確認してください。

## 組織の削除\{#delete-organization}

開始する前に、以下の条件が満たされていることを確認してください:

- 現在の組織内のすべてのクラスターが [deleted](./manage-cluster) されていること。

- 対象の組織で [組織オーナー](./organization-users) ロールが付与されていること。

- 残っている前払い資金はすべて返金が必要であること。

組織を削除するには:

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 削除したい組織に入ります。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **システム設定** ページで、**Delete Organization** エリアを見つけてボタンをクリックします。

1. ポップアップウィンドウの指示に従い、ボタンをクリックして組織の削除を完了します。

</Procedures>

<Admonition type="caution" icon="🚧" title="Warning">

<p>組織の削除は元に戻すことができません。この操作には十分注意してください。</p>

</Admonition>

![byoc-delete-organization](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-delete-organization.png "byoc-delete-organization")
