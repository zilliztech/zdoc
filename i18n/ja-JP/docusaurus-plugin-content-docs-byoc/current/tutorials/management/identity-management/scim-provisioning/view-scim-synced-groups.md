---
title: "SCIM 同期グループの表示 | BYOC"
slug: /view-scim-synced-groups
sidebar_label: "SCIM 同期グループの表示"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "SCIM プロビジョニングの設定後、ID プロバイダー (IdP) からプロビジョニングされたグループは、Zilliz Cloud に同期済みグループとして表示されます。これらのグループは Access Control で確認できます。 | BYOC"
type: origin
token: Er7Yw6Qnuiy8CBkDkH3cetOHnDf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# SCIM 同期グループの表示

SCIM プロビジョニングの設定後、ID プロバイダー (IdP) からプロビジョニングされたグループは、Zilliz Cloud に同期済みグループとして表示されます。これらのグループは Access Control で確認できます。

SCIM 同期グループは、Zilliz Cloud では読み取り専用です。Zilliz Cloud で SCIM 同期グループを直接作成したり、ユーザーを追加・招待したり、メンバーシップを変更したりすることはできません。グループ名、メンバーシップ、ライフサイクルは IdP 側で管理してください。変更内容は、SCIM を通じて IdP から Zilliz Cloud へ同期されます。

## 事前準備\{#before-you-start}

- [SCIM プロビジョニングの概要](/docs/scim-provisioning) を確認し、Zilliz Cloud 組織で SCIM プロビジョニングの設定が完了していること。

- IdP から Zilliz Cloud に少なくとも 1 つのグループがプロビジョニングされていること。

## 同期済みグループの確認\{#view-synced-groups}

以下のインタラクティブデモでは、Zilliz Cloud で SCIM 同期グループの一覧を開く手順を紹介しています。

<Supademo id="cmseasko70twvqm25bstzowox" title=""  />

<Procedures>

1. 左側のナビゲーションペインで **Access Control** をクリックします。

1. **Groups** タブを開きます。

1. IdP からプロビジョニングされたグループがグループリストに表示されていることを確認します。

</Procedures>
