---
title: "SCIM 同期グループの表示 | Cloud"
slug: /view-scim-synced-groups
sidebar_label: "SCIM 同期グループの表示"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "SCIM プロビジョニングの設定後、ID プロバイダー (IdP) からプロビジョニングされたグループは Zilliz Cloud に同期グループとして表示されます。これらのグループは Access Control で確認できます。 | Cloud"
type: origin
token: Er7Yw6Qnuiy8CBkDkH3cetOHnDf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# SCIM 同期グループの表示

SCIM プロビジョニングの設定後、ID プロバイダー (IdP) からプロビジョニングされたグループは Zilliz Cloud に同期グループとして表示されます。これらのグループは Access Control で確認できます。

SCIM 同期グループは Zilliz Cloud では読み取り専用です。Zilliz Cloud で SCIM 同期グループを直接作成したり、ユーザーを追加・招待したり、メンバーシップを変更したりすることはできません。グループ名、メンバーシップ、ライフサイクルは IdP で管理してください。IdP がそれらの変更を SCIM 経由で Zilliz Cloud に同期します。

## 始める前に\{#before-you-start}

- [SCIM Provisioning Overview](/docs/scim-provisioning) を確認し、Zilliz Cloud 組織の SCIM プロビジョニングを設定済みであること。

- IdP が少なくとも 1 つのグループを Zilliz Cloud にプロビジョニング済みであること。

## 同期グループの表示\{#view-synced-groups}

次のインタラクティブデモでは、Zilliz Cloud で SCIM 同期グループの一覧を開く手順を確認できます。

<Supademo id="cmseasko70twvqm25bstzowox" title=""  />

<Procedures>

1. 左側のナビゲーションペインで **Access Control** をクリックします。

1. **Groups** タブを開きます。

1. IdP からプロビジョニングされたグループがグループ一覧に表示されることを確認します。

</Procedures>
