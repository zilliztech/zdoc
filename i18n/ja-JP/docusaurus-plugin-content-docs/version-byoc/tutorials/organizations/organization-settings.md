---
title: "組織の設定を管理する | BYOC"
slug: /organization-settings
sidebar_label: "Organization Settings"
beta: FALSE
notebook: FALSE
description: "Organizationのオーナーの場合、Organizationの設定を管理する権限があります。 | BYOC"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - organizations
  - settings
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model

---

import Admonition from '@theme/Admonition';


# 組織の設定を管理する

Organizationのオーナーの場合、Organizationの設定を管理する権限があります。

このガイドでは、組織の設定を管理する手順を説明します。

## 組織を見る{#view-organizations}

Zilliz Cloudにサインアップすると、デフォルトの組織が作成されます。新しい組織を作成することはできませんが、招待により他のユーザーの組織に参加することができます。 

[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインすると、所属している組織のリストが表示されます。これらの組織をチェックアウトして入力することができます。

参加したすべての組織をすばやく表示するには、左上隅の**すべての組織**をクリックしてください。

![view-organizations](/img/view-organizations.png)

## 組織の名前を変更する{#rename-an-organization}

組織の名前を変更するには、[組織オーナー](./organization-users)である必要があります。

以下のいずれかの方法で組織の名前を変更できます:

- 組織一覧ページで組織の名前を変更します:

    ![rename-organization](/img/rename-organization.png)

- 組織を入力し、**システム設定**ページで名前を変更してください

    ![edit-organization-name](/img/edit-organization-name.png)

    </exclude>

    ![edit-organization-name-byoc](/img/edit-organization-name-byoc.png)

    </include>

## タイムゾーンを管理する{#manage-timezone}

システムのタイムゾーンは、最初のログインが行われる場所に設定され、Zilliz Cloudに表示されるすべての時間文字列に適用されます。

現在のタイムゾーンを表示するには、組織のオーナーまたはメンバーのいずれかになります。組織内の役割の詳細については、[組織のユーザーを管理する](./organization-users)を参照してください。

![timezone-settings](/img/timezone-settings.png)

</exclude>

![byoc-timezone-settings](/img/byoc-timezone-settings.png)

</include>

システムのタイムゾーンを変更するには、[組織オーナー](./organization-users)である必要があります。**編集**をクリックして**タイムゾーン設定**ダイアログボックスを開き、ドロップダウンリストからタイムゾーンを選択します。また、タイムゾーンの名前を入力して、希望のタイムゾーンを素早くフィルタリングすることもできます。

## メンテナンスウィンドウを設定する{#set-up-maintenance-window}

Zilliz Cloudがホストされたクラスターのメンテナンスをスケジュールするためのメンテナンスウィンドウを設定することができます。これにより、影響力のあるメンテナンスイベントがより予測可能になり、ワークロードの混乱が少なくなります。

現在、メンテナンスウィンドウの設定はグローバルであり、Zilliz Cloudでホストされているすべてのクラスタに適用されます。

デフォルトでは、Zilliz Cloudは、ピーク時の営業時間中に中断を避けるために、毎日現地時間の午前0時から午後2時まで、最も影響力のある更新をブロックします。特定の日に予定されているメンテナンスイベントについては、事前に通知が届きます。その日、Zilliz Cloudは希望する時間帯に対応します。

メンテナンスイベントは通常2時間続き、サービスの中断を引き起こす可能性があります。デフォルトのメンテナンスウィンドウは、現地時間の午前2時から午前4時の間です。「システムメンテナンスウィンドウ」のオプションを選択して、必要に応じてメンテナンスウィンドウを調整できます。

メンテナンスイベントが終了すると、別の通知が届きます。また、Zilliz Cloudでは、メンテナンスイベントの開始と終了を「アクティビティ」にリストしており、通知を見逃した場合に備えてさらに確認することができます。

現在のタイムゾーンを表示するには、左のナビゲーションウィンドウから**設定**を選択し、**システムメンテナンスウィンドウ**エリアの下に現在適用されているメンテナンスウィンドウの時間を見つけてください。

システムメンテナンスウィンドウの時間を変更するには、「編集」をクリックして「システムメンテナンスウィンドウの編集」ダイアログボックスを開き、「システムメンテナンスウィンドウ」ドロップダウンリストから時間ウィンドウを選択してください。

![maintenance-window](/img/maintenance-window.png)

</exclude>

![byoc-maintenance-window](/img/byoc-maintenance-window.png)

</include>

## 組織を削除{#delete-organization}

始める前に、以下の条件が満たされていることを確認してください。

- 現在の組織内のすべてのクラスターは[削除されました](./manage-cluster)です。

- すべての組織[手形](./view-invoice)は有料です。

</include>

- ターゲット組織で[組織オーナー](./organization-users)ロールが付与されます。

- すべての残りの前払い資金は返金する必要があります。

- サードパーティの[マーケットプレイスの購読はキャンセルする必要があります。](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription).

</include>

組織を削除するには: 

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインしてください。

1. 削除する組織を入力します。

1. 左側のナビゲーションペインで、**設定**をクリックしてください。

1. 「システム設定」ページで、「組織の削除」エリアを見つけて、ボタンをクリックしてください。

1. ポップアップウィンドウの指示に従い、ボタンをクリックして組織の削除を完了します。

<Admonition type="caution" icon="🚧" title="警告">

<p>組織を削除する操作は元に戻すことができません。この操作には特に注意してください。</p>

</Admonition>

![delete-organization-en](/img/delete-organization-en.png)

</exclude>

![byoc-delete-organization](/img/byoc-delete-organization.png)

</include>

