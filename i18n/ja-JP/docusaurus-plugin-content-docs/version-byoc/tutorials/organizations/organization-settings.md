---
title: "組織の設定を管理する | BYOC"
slug: /organization-settings
sidebar_label: "組織の設定を管理する"
beta: FALSE
notebook: FALSE
description: "Organizationのオーナーの場合、Organizationの設定を管理する権限があります。 | BYOC"
type: origin
token: RZLNwAWMBihTsNkl61VcYDCWnyd
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - organizations
  - settings
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus

---

import Admonition from '@theme/Admonition';


# 組織の設定を管理する

Organizationのオーナーの場合、Organizationの設定を管理する権限があります。

このガイドでは、組織の設定を管理する手順を説明します。

## 組織を見る{#view-organizations}

Zilliz Cloudにサインアップすると、デフォルトの組織が作成されます。新しい組織を作成することはできませんが、招待により他のユーザーの組織に参加することができます。

Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)にログインすると、所属している組織の一覧が表示されます。これらの組織を確認して入力することができます。

参加しているすべてのコミュニティをすばやく表示するには、左上の[**すべてのコミュニティ**]をクリックします。

![view-organizations](/img/view-organizations.png)

## 組織の名前を変更する{#rename-an-organization}

組織の名前を変更するには、[組織オーナー](./organization-users)である必要があります。

    ![edit-organization-name-byoc](/img/edit-organization-name-byoc.png)

## タイムゾーンの管理{#manage-timezone}

システムのタイムゾーンは、最初のログインが行われる場所に設定され、Zilliz Cloudに表示されるすべての時間文字列に適用されます。

現在のタイムゾーンを表示するには、組織オーナーまたは組織メンバーのいずれかになります。組織の役割の詳細については、「[組織のユーザーを管理する](./organization-users)」を参照してください。

![byoc-timezone-settings](/img/byoc-timezone-settings.png)

システムのタイムゾーンを変更するには、[組織オーナー](./organization-users)である必要があります。**編集**をクリックして**タイムゾーン設定**ダイアログボックスを開き、ドロップダウンリストからタイムゾーンを選択します。また、タイムゾーンの名前を入力して、希望のタイムゾーンを素早くフィルタリングすることもできます。

## メンテナンスウィンドウを設定する{#set-up-maintenance-window}

Zilliz Cloudがホストされたクラスターのメンテナンスをスケジュールするためのメンテナンスウィンドウを設定することができます。これにより、影響力のあるメンテナンスイベントがより予測可能になり、ワークロードの混乱が少なくなります。

現在、メンテナンスウィンドウの設定はグローバルであり、Zilliz Cloudでホストされているすべてのクラスタに適用されます。

デフォルトでは、Zilliz Cloudは、ピーク時の営業時間中に中断を避けるために、毎日現地時間の午前0時から午後2時まで、最も影響力のある更新をブロックします。特定の日に予定されているメンテナンスイベントについては、事前に通知が届きます。その日、Zilliz Cloudは希望する時間帯に対応します。

メンテナンスイベントは通常2時間続き、サービスの中断を引き起こす可能性があります。デフォルトのメンテナンスウィンドウは、現地時間の午前2時から午前4時の間です。「システムメンテナンスウィンドウ」のオプションを選択して、必要に応じてメンテナンスウィンドウを調整できます。

メンテナンスイベントが終了すると、別の通知が届きます。また、Zilliz Cloudでは、メンテナンスイベントの開始と終了を「アクティビティ」にリストしており、通知を見逃した場合に備えてさらに確認することができます。

現在のタイムゾーンを表示するには、左ナビゲーションウィンドウの[**設定**]を選択し、[**システムメンテナンスウィンドウ**]領域で現在適用されているメンテナンスウィンドウの時間を確認します。

システムメンテナンスウィンドウの時間を変更するには、[**編集**]をクリックして[システムメンテナンスウィンドウの編集]ダイアログボックスを開き、[**システムメンテナンスウィンドウ**]ドロップダウンリストから時間ウィンドウを選択します。

![byoc-maintenance-window](/img/byoc-maintenance-window.png)

## 組織を削除{#delete-organization}

始める前に、以下の条件が満たされていることを確認してください。

- 現在の組織内のすべてのクラスタが[削除され](./manage-cluster)ます。

- ターゲット組織で[Organization Owner](./organization-users)ロールが付与されていること。

- すべての残りの前払い資金は返金する必要があります。

組織を削除するには:

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 削除する組織を入力します。

1. 左側のナビゲーションウィンドウで、[**設定**]をクリックします。

1. [**システム設定**]ページで、[**組織削除**]領域を見つけて、ボタンをクリックします。

1. ポップアップウィンドウの指示に従い、ボタンをクリックして組織の削除を完了します。

<Admonition type="caution" icon="🚧" title="警告">

<p>組織を削除する操作は元に戻すことができません。この操作には特に注意してください。</p>

</Admonition>

![byoc-delete-organization](/img/byoc-delete-organization.png)

