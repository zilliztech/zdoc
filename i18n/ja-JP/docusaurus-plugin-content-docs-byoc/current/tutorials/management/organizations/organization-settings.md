---
title: "組織設定の管理 | BYOC"
slug: /organization-settings
sidebar_label: "組織設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Organization Owner は、組織設定を管理する権限を持っています。 | BYOC"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織設定の管理

Organization Owner は、組織設定を管理する権限を持っています。

このガイドでは、組織設定を管理する手順について説明します。

## 組織の表示\{#view-organizations}

Zilliz Cloud にサインアップすると、デフォルトの組織が自動的に作成されます。新しい組織を作成することはできませんが、招待を受けて他のユーザーの組織に参加できます。

[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインすると、参加している組織の一覧ページが表示されます。ここから各組織を確認し、アクセスできます。

参加しているすべての組織を素早く確認するには、左上隅の **All Organizations** をクリックします。

![view-organizations](https://zdoc-images.s3.us-west-2.amazonaws.com/view-organizations.png "view-organizations")

## 組織の作成\{#create-an-organization}

複数の組織が必要な場合は、[サポートチケットを送信](http://support.zilliz.com)してください。マルチ組織機能を有効にします。機能が有効になると、ご自身で新しい組織を作成できるようになります。

![SJ2xw2rO4h2LJTblDpmcgHh0nHg](https://zdoc-images.s3.us-west-2.amazonaws.com/SJ2xw2rO4h2LJTblDpmcgHh0nHg.png)

## 組織名の変更\{#rename-an-organization}

組織名を変更するには、[Organization Owner](./manage-platform-roles#predefined-organization-roles) である必要があります。

![edit-organization-name-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-organization-name-byoc.png "edit-organization-name-byoc")

## タイムゾーンの管理\{#manage-timezone}

システムのタイムゾーンは、最初にログインした場所に基づいて設定され、Zilliz Cloud に表示されるすべての時刻表記に適用されます。

現在のタイムゾーンを確認するには、Organization Owner または Organization Member のいずれかである必要があります。組織内のロールの詳細については、[プラットフォームロールの管理](./manage-platform-roles) を参照してください。

![byoc-timezone-settings](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-timezone-settings.png "byoc-timezone-settings")

システムのタイムゾーンを変更するには、[Organization Owner](./manage-platform-roles#predefined-organization-roles) である必要があります。**Edit** をクリックして **Time Zone Settings** ダイアログボックスを開き、ドロップダウンリストからタイムゾーンを選択します。タイムゾーン名を入力して、目的のタイムゾーンをすばやく絞り込むこともできます。

## 優先メンテナンス時間枠の設定\{#set-up-preferred-maintenance-window}

優先メンテナンス時間枠とは、Zilliz Cloud がスケジュールされたメンテナンス（Dedicated クラスターの Milvus バージョンアップグレードなど）を自動的に実行する **4時間** の期間です。

優先時間枠を設定することで、トラフィックのピーク時間帯を避けてメンテナンスをスケジュールでき、ワークロードへの影響を最小限に抑えられます。

デフォルトでは、時間枠は **午前2:00～午前6:00** に設定されています。必要に応じて変更できます。

次のデモでは、優先メンテナンス時間枠を編集する方法を示します。

<Supademo id="cmn4bhv4l0ps5z3qmdcrmuij7" title=""  />

<Admonition type="info" icon="📘" title="Note">

メンテナンスが優先時間枠を超えても、完了するまで継続されます。

</Admonition>

スケジュールされたメンテナンスの7日前に、Web コンソールの **クラスター概要** ページに通知が表示されます。

![Czaab7qPaoElX6xVizQcEiwznmh](https://zdoc-images.s3.us-west-2.amazonaws.com/czaab7qpaoelx6xvizqceiwznmh.png "Czaab7qPaoElX6xVizQcEiwznmh")

- **Organization Owners** および **Project Admins** は、以下のいずれかを選択できます。

    - クラスターを最新の Milvus バージョンへ即時アップグレードする。

    - メンテナンスを7日間延期する。延期は1回のみ可能です。

    - 何もしないで、スケジュール通りにメンテナンスを実行させる。

- **Organization Members** の場合は、[SDK の互換性](./install-sdks#sdk-compatibility) を確認してください。

## 組織の削除\{#delete-organization}

開始する前に、以下の条件を満たしていることを確認してください。

- 現在の組織内のすべてのクラスターが[削除済み](./manage-cluster)であること。

- 対象の組織で [Organization Owner](./manage-platform-roles#predefined-organization-roles) ロールが付与されていること。

- 残りの前払い金がすべて返金済みであること。

組織を削除するには、以下の手順を実行します。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 削除したい組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **System Settings** ページの **Delete Organization** セクションにあるボタンをクリックします。

1. ポップアップウィンドウの指示に従い、ボタンをクリックして組織の削除を完了します。

</Procedures>

<Admonition type="danger" icon="🚧" title="🚧 Warning">

組織の削除は取り消せません。操作の際は十分にご注意ください。

</Admonition>

![byoc-delete-organization](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-delete-organization.png "byoc-delete-organization")

