---
title: "組織設定を管理 | Cloud"
slug: /organization-settings
sidebar_label: "組織設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "組織オーナーである場合、組織設定を管理する特権があります。 | Cloud"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 2
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - 組織
  - 設定
  - オープンソースベクターデータベース
  - ベクターインデックス
  - オープンソースベクターデータベース
  - オープンソースベクターデータベース

---

import Admonition from '@theme/Admonition';


# 組織設定を管理

組織オーナーである場合、組織設定を管理する特権があります。

このガイドでは、組織設定を管理する手順を説明します。

## 組織を表示\{#view-organizations}

Zilliz Cloudにサインアップすると、デフォルトの組織が作成されます。新しい組織を作成することはできませんが、招待により他のユーザーの組織に参加できます。

[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインすると、所属している組織をリスト表示するページに移動します。これらの組織を確認して入ることができます。

参加しているすべての組織をすばやく表示するには、左上隅の**すべての組織**をクリックしてください。

![view-organizations](/img/view-organizations.png)

## 組織名を変更\{#rename-an-organization}

組織名を変更するには、[組織オーナー](./organization-users)である必要があります。

以下のいずれかの方法で組織名を変更できます：

- 組織一覧ページで組織名を変更：

    ![rename-organization](/img/rename-organization.png)

- 組織に入り、**システム設定**ページで名前を変更：

    ![edit-organization-name](/img/edit-organization-name.png)

## タムゾーンを管理\{#manage-timezone}

システムタイムゾーンは、最初にログインした場所に設定され、Zilliz Cloudに表示されるすべての時刻文字列に適用されます。

現在のタイムゾーンを表示するには、組織オーナーまたは組織メンバーである必要があります。組織内のロールの詳細については、[組織ユーザーを管理](./organization-users)を参照してください。

![timezone-settings](/img/timezone-settings.png)

システムタイムゾーンを変更するには、[組織オーナー](./organization-users)である必要があります。**編集**をクリックして**タイムゾーン設定**ダイアログボックスを開き、ドロップダウンリストからタイムゾーンを選択します。また、タイムゾーン名を入力して目的のタイムゾーンをすばやくフィルタリングすることもできます。

## メンテナンスウィンドウを設定\{#set-up-maintenance-window}

メンテナンスウィンドウを設定して、Zilliz Cloudがホストしているクラスターのメンテナンスをスケジュールできるようにできます。これにより、影響のあるメンテナンスイベントが作業負荷に対して予測可能で邪魔にならないようにします。

現在、メンテナンスウィンドウ設定はグローバルであり、Zilliz Cloudでホストされているすべてのクラスターに適用されます。

デフォルトでは、Zilliz Cloudは業務時間帯の混乱を避けるために、現地時間の午前0時から午前2時までの最も影響のある更新をブロックします。特定の日の今後のメンテナンスイベントについては、事前に通知を受け取ります。その日には、Zilliz Cloudが好ましいウィンドウ時間中に行動を起こします。

メンテナンスイベントは通常2時間継続し、サービスの中断が発生する可能性があります。デフォルトのメンテナンスウィンドウは現地時間の午前2時から午前4時の間です。ニーズに合わせて「システムメンテナンスウィンドウ」のオプションを選択して、メンテナンスウィンドウを調整できます。

メンテナンスイベントが終了した後に、もう一つの通知を受け取ります。Zilliz Cloudは、「アクティビティ」にすべてのメンテナンスイベントの開始と終了もリストしますので、通知を見逃した場合に備えて確認できます。

現在のタイムゾーンを表示するには、左側のナビゲーションペインから**設定**を選択し、**システムメンテナンスウィンドウ**領域で現在適用されているメンテナンスウィンドウ時間を確認します。

システムメンテナンスウィンドウ時間を変更するには、**編集**をクリックして「編集システムメンテナンスウィンドウ」ダイアログボックスを開き、「システムメンテナンスウィンドウ」ドロップダウンリストから時間ウィンドウを選択します。

![maintenance-window](/img/maintenance-window.png)

## 組織を削除\{#delete-organization}

開始前に、以下の条件が満たされていることを確認してください：

- 現在の組織内のすべてのクラスターが[削除](./manage-cluster)されている。

- すべての組織[請求](./view-invoice)が支払われている。

- 対象組織で[組織オーナー](./organization-users)ロールが付与されている。

- 残っているすべての前払い資金が返金される必要がある。

- サードパーティー[マーケットプレイスサブスクリプションをキャンセルする必要があります](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription)。

組織を削除するには：

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 削除する組織に入ります。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **システム設定**ページで、**組織を削除**領域を見つけ、ボタンをクリックします。

1. ポップアップウィンドウの指示に従い、ボタンをクリックして組織の削除を完了します。

<Admonition type="caution" icon="🚧" title="警告">

<p>組織を削除する操作は元に戻せません。この操作には特に注意してください。</p>

</Admonition>

![delete-organization-en](/img/delete-organization-en.png)
