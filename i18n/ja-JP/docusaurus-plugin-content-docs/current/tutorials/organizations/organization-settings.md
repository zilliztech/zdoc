---
title: "組織設定の管理 | Cloud"
slug: /organization-settings
sidebar_label: "組織設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "組織オーナーである場合、組織設定を管理する権限があります。 | Cloud"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - cloud
  - organizations
  - settings
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus

---

import Admonition from '@theme/Admonition';


# 組織設定の管理

組織オーナーである場合、組織設定を管理する権限があります。

このガイドでは、組織設定の管理手順について説明します。

## 組織の表示\{#view-organizations}

Zilliz Cloudにサインアップすると、デフォルトの組織が作成されます。新しい組織を作成することはできませんが、招待を通じて他のユーザーの組織に参加することができます。

[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインすると、所属している組織を一覧表示するページに移動します。これらの組織を確認して入ることができます。

参加しているすべての組織を素早く表示するには、左上隅の**「すべての組織」**をクリックしてください。

![view-organizations](/img/view-organizations.png "view-organizations")

## 組織名の変更\{#rename-an-organization}

組織名を変更するには、[組織オーナー](./organization-users)である必要があります。

以下のいずれかの方法で組織名を変更できます：

- 組織一覧ページで組織名を変更する：

    ![rename-organization](/img/rename-organization.png "rename-organization")

- 組織に入り、**「システム設定」**ページで名前を変更する：

    ![edit-organization-name](/img/edit-organization-name.png "edit-organization-name")

## タイムゾーンの管理\{#manage-timezone}

システムタイムゾーンは、最初のログインが発生した場所に設定され、Zilliz Cloud上で表示されるすべての時間文字列に適用されます。

現在のタイムゾーンを表示するには、組織オーナーまたは組織メンバーである必要があります。組織内の役割の詳細については、[組織ユーザーの管理](./organization-users)を参照してください。

![timezone-settings](/img/timezone-settings.png "timezone-settings")

システムタイムゾーンを変更するには、[組織オーナー](./organization-users)である必要があります。**「編集」**をクリックして**「タイムゾーン設定」**ダイアログボックスを開き、ドロップダウンリストからタイムゾーンを選択します。また、タイムゾーン名を入力して目的のタイムゾーンを素早くフィルタリングすることもできます。

## メンテナンスウィンドウの設定\{#set-up-maintenance-window}

メンテナンスウィンドウを設定して、Zilliz Cloudがホストされたクラスターのメンテナンスをスケジュールできるようにできます。これにより、影響を与える可能性のあるメンテナンスイベントをより予測可能にし、ワークロードに対する邪魔を少なくすることができます。

現在、メンテナンスウィンドウの設定はグローバルであり、Zilliz Cloud上でホストされているすべてのクラスターに適用されます。

デフォルトでは、Zilliz Cloudは業務時間中の混乱を避けるため、毎日午前0時から午後2時までの間、大部分の影響を与えるアップデートをブロックしています。特定の日に発生する予定のメンテナンスイベントについては、事前に通知を受け取ります。その日には、Zilliz Cloudは推奨されるウィンドウ時間内に作業を行います。

メンテナンスイベントは通常2時間続き、サービスの中断を引き起こす可能性があります。デフォルトのメンテナンスウィンドウは午前2時から午前4時の間です。ニーズに合わせて、「システムメンテナンスウィンドウ」からオプションを選択して、メンテナンスウィンドウを調整できます。

メンテナンスイベントが終了した後にもう一度通知を受け取ります。Zilliz Cloudは、「アクティビティ」内にすべてのメンテナンスイベントの開始と終了も記載しているため、通知を見逃した場合でも確認できます。

現在のタイムゾーンを表示するには、左側のナビゲーションペインから**「設定」**を選択し、「システムメンテナンスウィンドウ」領域の現在適用されているメンテナンスウィンドウ時間を探すか、右側の**「編集」**をクリックして、**「システムメンテナンスウィンドウ」**ダイアログボックスを開きます。

![maintenance-window](/img/maintenance-window.png "maintenance-window")

## 組織の削除\{#delete-organization}

開始する前に、以下の条件がすべて満たされていることを確認してください：

- 現在の組織内のすべてのクラスターが[削除されている](./manage-cluster)。
- 現在の組織内のすべてのボリュームが[削除されている](./manage-volumes-via-console#delete-a-volume)。
- すべての組織[請求書](./view-invoice)が支払われている。
- 対象の組織で[組織オーナー](./organization-users)の役割が付与されている。
- 残っている前払い資金はすべて返金される必要があります。
- サードパーティの[マーケットプレイスサブスクリプションがキャンセルされている](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription)。

組織を削除するには：

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。
2. 削除したい組織に入ります。
3. 左側のナビゲーションペインで、**「設定」**をクリックします。
4. **「システム設定」**ページで、「組織の削除」領域を見つけ、ボタンをクリックします。
5. ポップアップウィンドウの指示に従って、ボタンをクリックして組織の削除を完了します。

<Admonition type="caution" icon="🚧" title="Warning">

<p>組織を削除する操作は元に戻すことができません。この操作には十分に注意してください。</p>

</Admonition>

![delete-organization-en](/img/delete-organization-en.png "delete-organization-en")