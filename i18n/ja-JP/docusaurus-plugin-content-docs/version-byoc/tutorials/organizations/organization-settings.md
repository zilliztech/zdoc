---
title: "組織設定の管理 | BYOC"
slug: /organization-settings
sidebar_key: organization-settings
sidebar_label: "組織設定"
beta: FALSE
notebook: FALSE
description: "組織オーナーの場合、組織設定を管理する権限があります。| BYOC"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - organizations
  - settings

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織設定の管理

組織オーナーである場合、組織設定を管理する権限があります。

このガイドでは、組織設定を管理する手順について説明します。

## 組織の表示\{#view-organizations}

Zilliz Cloud にサインアップすると、デフォルトの組織が作成されます。新しい組織を作成することはできませんが、招待を通じて他のユーザーの組織に参加することができます。

[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインすると、あなたが所属している組織の一覧ページが表示されます。これらの組織を確認し、進入することができます。

参加しているすべての組織をすばやく表示するには、左上隅にある **すべての組織** をクリックしてください。

![view-organizations](https://zdoc-images.s3.us-west-2.amazonaws.com/view-organizations.png "view-organizations")

## 組織の名前変更\{#rename-an-organization}

組織の名前を変更するには、[組織オーナー](./organization-users) である必要があります。

![edit-organization-name-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-organization-name-byoc.png "edit-organization-name-byoc")

## タイムゾーンの管理\{#manage-timezone}

システムのタイムゾーンは、最初のログイン時に設定され、Zilliz Cloud に表示されるすべての時刻文字列に適用されます。

現在のタイムゾーンを表示するには、組織オーナーまたは組織メンバーである必要があります。組織内の役割の詳細については、[組織ユーザーの管理](./organization-users) を参照してください。

![byoc-timezone-settings](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-timezone-settings.png "byoc-timezone-settings")

システムのタイムゾーンを変更するには、[組織オーナー](./organization-users) である必要があります。**編集** をクリックして **タイムゾーン設定** ダイアログボックスを開き、ドロップダウンリストからタイムゾーンを選択します。また、タイムゾーンの名前を入力して、目的のタイムゾーンをすばやくフィルターすることもできます。

## 優先メンテナンスウィンドウの設定\{#set-up-preferred-maintenance-window}

優先メンテナンスウィンドウとは、Zilliz Cloud が Dedicated クラスターの Milvus バージョンのアップグレードなどの予定されたメンテナンスを自動的に実行する**4 時間**の期間です。

優先ウィンドウを設定することで、トラフィックのピーク時を避けてメンテナンスをスケジュールし、ワークロードへの影響を最小限に抑えることができます。

デフォルトでは、ウィンドウは **午前 2:00～午前 6:00** に設定されています。必要に応じて更新できます。

以下のデモでは、優先メンテナンスウィンドウを編集する方法を示しています。

<Supademo id="cmn4bhv4l0ps5z3qmdcrmuij7" title=""  />

<Admonition type="info" icon="📘" title="Note">

<p>メンテナンスが優先ウィンドウを超えて実行された場合、完了するまで継続されます。</p>

</Admonition>

予定されたメンテナンスの 7 日前に、Web コンソールの **クラスター概要** ページに通知が表示されます。

![Czaab7qPaoElX6xVizQcEiwznmh](https://zdoc-images.s3.us-west-2.amazonaws.com/czaab7qpaoelx6xvizqceiwznmh.png "Czaab7qPaoElX6xVizQcEiwznmh")

- **組織オーナー** および **プロジェクト管理者** は、次のいずれかを選択できます。

    - クラスターを最新の Milvus バージョンにすぐにアップグレードする。

    - メンテナンスを 7 日間延期する。延期は 1 回のみ可能です。

    - 何もしないで、メンテナンスを予定通りに実行させる。

- **組織メンバー** の場合は、[SDK の互換性](./install-sdks#sdk-compatibility) を確認してください。

## 組織の削除\{#delete-organization}

開始する前に、以下の条件が満たされていることを確認してください。

- 現在の組織内のすべてのクラスターが [削除](./manage-cluster) されていること。

- 対象組織で [組織オーナー](./organization-users) の役割が付与されていること。

- 残っている前払い資金がすべて返金されていること。

組織を削除するには：

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 削除したい組織に入ります。

1. 左側のナビゲーションペインで、**設定** をクリックします。

1. **システム設定** ページで、**組織の削除** エリアを見つけてボタンをクリックします。

1. ポップアップウィンドウの指示に従い、ボタンをクリックして組織の削除を完了します。

</Procedures>

<Admonition type="caution" icon="🚧" title="Warning">

<p>組織の削除操作は元に戻せません。この操作には十分注意してください。</p>

</Admonition>

![byoc-delete-organization](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-delete-organization.png "byoc-delete-organization")

